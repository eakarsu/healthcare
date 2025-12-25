import SwiftUI
import LocalAuthentication
import Combine

// MARK: - Auth Manager

@MainActor
final class AuthManager: ObservableObject {
    static let shared = AuthManager()

    // MARK: - Published Properties

    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var error: Error?
    @Published var biometricType: BiometricType = .none

    // MARK: - Private Properties

    private let apiClient = APIClient.shared
    private let keychainService = KeychainService.shared
    private let userDefaults = UserDefaultsService.shared

    // MARK: - Initialization

    private init() {
        checkBiometricType()
        checkExistingSession()
    }

    // MARK: - Biometric Authentication

    enum BiometricType {
        case none
        case touchID
        case faceID

        var displayName: String {
            switch self {
            case .none: return "None"
            case .touchID: return "Touch ID"
            case .faceID: return "Face ID"
            }
        }

        var icon: String {
            switch self {
            case .none: return "lock"
            case .touchID: return "touchid"
            case .faceID: return "faceid"
            }
        }
    }

    private func checkBiometricType() {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            biometricType = .none
            return
        }

        switch context.biometryType {
        case .touchID:
            biometricType = .touchID
        case .faceID:
            biometricType = .faceID
        default:
            biometricType = .none
        }
    }

    var isBiometricAvailable: Bool {
        biometricType != .none
    }

    var isBiometricEnabled: Bool {
        keychainService.isBiometricEnabled()
    }

    // MARK: - Session Management

    private func checkExistingSession() {
        guard let token = keychainService.getAccessToken(),
              !token.isEmpty else {
            isAuthenticated = false
            return
        }

        // Load cached user
        if let user = keychainService.getUser() {
            currentUser = user
            isAuthenticated = true

            // Refresh user data in background
            Task {
                await refreshCurrentUser()
            }
        }
    }

    // MARK: - Login

    func login(email: String, password: String) async throws {
        isLoading = true
        error = nil

        do {
            let response: AuthResponse = try await apiClient.request(
                endpoint: .login(email: email, password: password),
                responseType: AuthResponse.self
            )

            // Save tokens
            keychainService.saveTokens(
                accessToken: response.accessToken,
                refreshToken: response.refreshToken
            )

            // Save user
            keychainService.saveUser(response.user)

            currentUser = response.user
            isAuthenticated = true
            isLoading = false

        } catch {
            self.error = error
            isLoading = false
            throw error
        }
    }

    // MARK: - Biometric Login

    func loginWithBiometric() async throws {
        guard isBiometricEnabled else {
            throw AuthError.biometricNotEnabled
        }

        let context = LAContext()
        context.localizedCancelTitle = "Use Password"

        let reason = "Log in to PracticeFlux"

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )

            if success {
                // Biometric succeeded, check for existing session
                if keychainService.getAccessToken() != nil {
                    if let user = keychainService.getUser() {
                        currentUser = user
                        isAuthenticated = true
                    }
                } else {
                    throw AuthError.noStoredCredentials
                }
            }
        } catch {
            throw AuthError.biometricFailed(error)
        }
    }

    func enableBiometric() async throws {
        guard isBiometricAvailable else {
            throw AuthError.biometricNotAvailable
        }

        let context = LAContext()
        let reason = "Enable \(biometricType.displayName) for quick login"

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )

            if success {
                keychainService.setBiometricEnabled(true)
            }
        } catch {
            throw AuthError.biometricFailed(error)
        }
    }

    func disableBiometric() {
        keychainService.setBiometricEnabled(false)
    }

    // MARK: - Logout

    func logout() async {
        isLoading = true

        // Try to logout on server (ignore errors)
        try? await apiClient.request(endpoint: .logout)

        // Clear local data
        keychainService.clearAll()
        userDefaults.clearAll()

        currentUser = nil
        isAuthenticated = false
        isLoading = false
    }

    // MARK: - Refresh User

    func refreshCurrentUser() async {
        do {
            let user: User = try await apiClient.request(
                endpoint: .currentUser,
                responseType: User.self
            )

            keychainService.saveUser(user)
            currentUser = user

        } catch {
            // If unauthorized, logout
            if case APIError.unauthorized = error {
                await logout()
            }
        }
    }

    // MARK: - Update Profile

    func updateProfile(_ user: User) async throws {
        isLoading = true
        error = nil

        do {
            let updatedUser: User = try await apiClient.request(
                endpoint: .updateProfile(user),
                responseType: User.self
            )

            keychainService.saveUser(updatedUser)
            currentUser = updatedUser
            isLoading = false

        } catch {
            self.error = error
            isLoading = false
            throw error
        }
    }

    // MARK: - Change Password

    func changePassword(currentPassword: String, newPassword: String) async throws {
        isLoading = true
        error = nil

        do {
            try await apiClient.request(
                endpoint: .changePassword(currentPassword: currentPassword, newPassword: newPassword)
            )
            isLoading = false

        } catch {
            self.error = error
            isLoading = false
            throw error
        }
    }
}

// MARK: - Auth Errors

enum AuthError: LocalizedError {
    case biometricNotAvailable
    case biometricNotEnabled
    case biometricFailed(Error)
    case noStoredCredentials
    case invalidCredentials
    case sessionExpired

    var errorDescription: String? {
        switch self {
        case .biometricNotAvailable:
            return "Biometric authentication is not available on this device"
        case .biometricNotEnabled:
            return "Biometric authentication is not enabled"
        case .biometricFailed(let error):
            return "Biometric authentication failed: \(error.localizedDescription)"
        case .noStoredCredentials:
            return "No stored credentials found. Please log in with your password."
        case .invalidCredentials:
            return "Invalid email or password"
        case .sessionExpired:
            return "Your session has expired. Please log in again."
        }
    }
}
