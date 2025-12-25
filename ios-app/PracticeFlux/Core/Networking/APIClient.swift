import Foundation
import Combine

// MARK: - API Client

@MainActor
final class APIClient: ObservableObject {
    static let shared = APIClient()

    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    @Published var isLoading = false

    private init() {
        guard let url = URL(string: AppState.Configuration.apiBaseURL) else {
            fatalError("Invalid API base URL")
        }
        self.baseURL = url

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        config.waitsForConnectivity = true
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601

        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }

    // MARK: - Request Methods

    func request<T: Decodable>(
        endpoint: Endpoint,
        responseType: T.Type
    ) async throws -> T {
        let request = try buildRequest(for: endpoint)
        return try await execute(request, responseType: responseType)
    }

    func request(endpoint: Endpoint) async throws {
        let request = try buildRequest(for: endpoint)
        let _: EmptyResponse = try await execute(request, responseType: EmptyResponse.self)
    }

    // MARK: - Request Building

    private func buildRequest(for endpoint: Endpoint) throws -> URLRequest {
        var components = URLComponents(url: baseURL.appendingPathComponent(endpoint.path), resolvingAgainstBaseURL: true)

        if let queryItems = endpoint.queryItems {
            components?.queryItems = queryItems
        }

        guard let url = components?.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        // Add authorization header if available
        if endpoint.requiresAuth, let token = KeychainService.shared.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Add custom headers
        endpoint.headers?.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }

        // Add body
        if let body = endpoint.body {
            request.httpBody = try encoder.encode(body)
        }

        return request
    }

    // MARK: - Request Execution

    private func execute<T: Decodable>(
        _ request: URLRequest,
        responseType: T.Type
    ) async throws -> T {
        isLoading = true
        defer { isLoading = false }

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }

            // Handle different status codes
            switch httpResponse.statusCode {
            case 200...299:
                return try decoder.decode(T.self, from: data)

            case 401:
                // Try to refresh token
                if let refreshed = try? await refreshToken() {
                    if refreshed {
                        // Retry original request with new token
                        var newRequest = request
                        if let token = KeychainService.shared.getAccessToken() {
                            newRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                        }
                        let (retryData, retryResponse) = try await session.data(for: newRequest)
                        guard let retryHttpResponse = retryResponse as? HTTPURLResponse,
                              (200...299).contains(retryHttpResponse.statusCode) else {
                            throw APIError.unauthorized
                        }
                        return try decoder.decode(T.self, from: retryData)
                    }
                }
                throw APIError.unauthorized

            case 403:
                throw APIError.forbidden

            case 404:
                throw APIError.notFound

            case 422:
                if let validationError = try? decoder.decode(ValidationErrorResponse.self, from: data) {
                    throw APIError.validation(validationError.errors)
                }
                throw APIError.serverError(httpResponse.statusCode, "Validation error")

            case 500...599:
                throw APIError.serverError(httpResponse.statusCode, "Server error")

            default:
                throw APIError.serverError(httpResponse.statusCode, "Unexpected error")
            }

        } catch let error as APIError {
            throw error
        } catch let error as DecodingError {
            throw APIError.decodingError(error)
        } catch {
            throw APIError.networkError(error)
        }
    }

    // MARK: - Token Refresh

    private func refreshToken() async throws -> Bool {
        guard let refreshToken = KeychainService.shared.getRefreshToken() else {
            return false
        }

        let endpoint = Endpoint.refreshToken(refreshToken)
        let request = try buildRequest(for: endpoint)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            // Clear tokens on failed refresh
            KeychainService.shared.clearTokens()
            return false
        }

        let authResponse = try decoder.decode(AuthResponse.self, from: data)
        KeychainService.shared.saveTokens(
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken
        )

        return true
    }
}

// MARK: - Empty Response

private struct EmptyResponse: Decodable {}

// MARK: - Validation Error Response

struct ValidationErrorResponse: Decodable {
    let errors: [String: [String]]
}

// MARK: - API Error

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case forbidden
    case notFound
    case validation([String: [String]])
    case serverError(Int, String)
    case networkError(Error)
    case decodingError(DecodingError)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "You are not authorized. Please log in again."
        case .forbidden:
            return "You don't have permission to access this resource"
        case .notFound:
            return "The requested resource was not found"
        case .validation(let errors):
            let messages = errors.values.flatMap { $0 }
            return messages.joined(separator: "\n")
        case .serverError(_, let message):
            return message
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Failed to process response: \(error.localizedDescription)"
        }
    }
}

// MARK: - HTTP Method

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

// MARK: - Endpoint

struct Endpoint {
    let path: String
    let method: HTTPMethod
    let body: Encodable?
    let queryItems: [URLQueryItem]?
    let headers: [String: String]?
    let requiresAuth: Bool

    init(
        path: String,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        queryItems: [URLQueryItem]? = nil,
        headers: [String: String]? = nil,
        requiresAuth: Bool = true
    ) {
        self.path = path
        self.method = method
        self.body = body
        self.queryItems = queryItems
        self.headers = headers
        self.requiresAuth = requiresAuth
    }
}

// MARK: - Endpoint Wrapper for Encodable

private struct AnyEncodable: Encodable {
    private let encode: (Encoder) throws -> Void

    init<T: Encodable>(_ wrapped: T) {
        self.encode = wrapped.encode
    }

    func encode(to encoder: Encoder) throws {
        try encode(encoder)
    }
}

extension Endpoint {
    var wrappedBody: AnyEncodable? {
        body.map { AnyEncodable($0) }
    }
}

extension JSONEncoder {
    func encode(_ value: Encodable?) throws -> Data? {
        guard let value = value else { return nil }
        return try encode(AnyEncodable(value))
    }
}
