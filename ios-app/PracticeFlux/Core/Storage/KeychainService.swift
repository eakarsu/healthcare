import Foundation
import Security

// MARK: - Keychain Service

final class KeychainService {
    static let shared = KeychainService()

    private let accessTokenKey = "com.practiceflux.accessToken"
    private let refreshTokenKey = "com.practiceflux.refreshToken"
    private let userDataKey = "com.practiceflux.userData"
    private let biometricEnabledKey = "com.practiceflux.biometricEnabled"

    private init() {}

    // MARK: - Token Management

    func saveTokens(accessToken: String, refreshToken: String) {
        save(accessToken, forKey: accessTokenKey)
        save(refreshToken, forKey: refreshTokenKey)
    }

    func getAccessToken() -> String? {
        get(forKey: accessTokenKey)
    }

    func getRefreshToken() -> String? {
        get(forKey: refreshTokenKey)
    }

    func clearTokens() {
        delete(forKey: accessTokenKey)
        delete(forKey: refreshTokenKey)
    }

    // MARK: - User Data

    func saveUser(_ user: User) {
        guard let data = try? JSONEncoder().encode(user) else { return }
        save(data, forKey: userDataKey)
    }

    func getUser() -> User? {
        guard let data = getData(forKey: userDataKey) else { return nil }
        return try? JSONDecoder().decode(User.self, from: data)
    }

    func clearUser() {
        delete(forKey: userDataKey)
    }

    // MARK: - Biometric Settings

    func setBiometricEnabled(_ enabled: Bool) {
        save(enabled ? "true" : "false", forKey: biometricEnabledKey)
    }

    func isBiometricEnabled() -> Bool {
        get(forKey: biometricEnabledKey) == "true"
    }

    // MARK: - Clear All

    func clearAll() {
        clearTokens()
        clearUser()
        delete(forKey: biometricEnabledKey)
    }

    // MARK: - Private Methods

    private func save(_ value: String, forKey key: String) {
        guard let data = value.data(using: .utf8) else { return }
        save(data, forKey: key)
    }

    private func save(_ data: Data, forKey key: String) {
        // Delete existing item first
        delete(forKey: key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        SecItemAdd(query as CFDictionary, nil)
    }

    private func get(forKey key: String) -> String? {
        guard let data = getData(forKey: key) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func getData(forKey key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else { return nil }
        return result as? Data
    }

    private func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - Secure Enclave Support

extension KeychainService {

    /// Saves data with biometric protection
    func saveWithBiometric(_ value: String, forKey key: String) throws {
        guard let data = value.data(using: .utf8) else {
            throw KeychainError.encodingFailed
        }

        // Delete existing item first
        delete(forKey: key)

        var error: Unmanaged<CFError>?
        guard let accessControl = SecAccessControlCreateWithFlags(
            kCFAllocatorDefault,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            .biometryCurrentSet,
            &error
        ) else {
            throw KeychainError.accessControlCreationFailed
        }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessControl as String: accessControl
        ]

        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    /// Retrieves data protected by biometric
    func getWithBiometric(forKey key: String, prompt: String) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecUseOperationPrompt as String: prompt
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        switch status {
        case errSecSuccess:
            guard let data = result as? Data else { return nil }
            return String(data: data, encoding: .utf8)
        case errSecUserCanceled:
            throw KeychainError.userCanceled
        case errSecAuthFailed:
            throw KeychainError.authenticationFailed
        default:
            throw KeychainError.retrievalFailed(status)
        }
    }
}

// MARK: - Keychain Error

enum KeychainError: LocalizedError {
    case encodingFailed
    case accessControlCreationFailed
    case saveFailed(OSStatus)
    case retrievalFailed(OSStatus)
    case userCanceled
    case authenticationFailed

    var errorDescription: String? {
        switch self {
        case .encodingFailed:
            return "Failed to encode data"
        case .accessControlCreationFailed:
            return "Failed to create access control"
        case .saveFailed(let status):
            return "Failed to save to keychain: \(status)"
        case .retrievalFailed(let status):
            return "Failed to retrieve from keychain: \(status)"
        case .userCanceled:
            return "Authentication was canceled"
        case .authenticationFailed:
            return "Authentication failed"
        }
    }
}
