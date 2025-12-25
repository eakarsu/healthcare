import Foundation

// MARK: - User Model

struct User: Codable, Identifiable, Equatable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let phone: String?
    let dateOfBirth: Date?
    let role: UserRole
    let status: UserStatus
    let avatarUrl: String?
    let createdAt: Date
    let updatedAt: Date

    var fullName: String {
        "\(firstName) \(lastName)"
    }

    var initials: String {
        let firstInitial = firstName.first.map(String.init) ?? ""
        let lastInitial = lastName.first.map(String.init) ?? ""
        return "\(firstInitial)\(lastInitial)".uppercased()
    }

    enum CodingKeys: String, CodingKey {
        case id, email, phone, role, status
        case firstName = "first_name"
        case lastName = "last_name"
        case dateOfBirth = "date_of_birth"
        case avatarUrl = "avatar_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

enum UserRole: String, Codable, CaseIterable {
    case patient = "PATIENT"
    case provider = "PROVIDER"
    case admin = "ADMIN"
    case staff = "STAFF"

    var displayName: String {
        switch self {
        case .patient: return "Patient"
        case .provider: return "Provider"
        case .admin: return "Administrator"
        case .staff: return "Staff"
        }
    }
}

enum UserStatus: String, Codable {
    case active = "ACTIVE"
    case inactive = "INACTIVE"
    case pending = "PENDING"
    case suspended = "SUSPENDED"
}

// MARK: - Auth Response

struct AuthResponse: Codable {
    let user: User
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int

    enum CodingKeys: String, CodingKey {
        case user
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresIn = "expires_in"
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RefreshTokenRequest: Codable {
    let refreshToken: String

    enum CodingKeys: String, CodingKey {
        case refreshToken = "refresh_token"
    }
}
