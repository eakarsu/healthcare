import Foundation
import Combine

// MARK: - User Defaults Service

final class UserDefaultsService {
    static let shared = UserDefaultsService()

    private let defaults: UserDefaults
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    // MARK: - Keys

    private enum Keys {
        static let isOnboarded = "isOnboarded"
        static let themeMode = "themeMode"
        static let notificationsEnabled = "notificationsEnabled"
        static let biometricEnabled = "biometricEnabled"
        static let lastSyncDate = "lastSyncDate"
        static let cachedAppointments = "cachedAppointments"
        static let cachedMessages = "cachedMessages"
        static let offlineQueue = "offlineQueue"
    }

    private init() {
        self.defaults = UserDefaults.standard
    }

    // MARK: - Onboarding

    var isOnboarded: Bool {
        get { defaults.bool(forKey: Keys.isOnboarded) }
        set { defaults.set(newValue, forKey: Keys.isOnboarded) }
    }

    // MARK: - Theme

    var themeMode: String {
        get { defaults.string(forKey: Keys.themeMode) ?? "system" }
        set { defaults.set(newValue, forKey: Keys.themeMode) }
    }

    // MARK: - Notifications

    var notificationsEnabled: Bool {
        get { defaults.bool(forKey: Keys.notificationsEnabled) }
        set { defaults.set(newValue, forKey: Keys.notificationsEnabled) }
    }

    // MARK: - Biometric

    var biometricEnabled: Bool {
        get { defaults.bool(forKey: Keys.biometricEnabled) }
        set { defaults.set(newValue, forKey: Keys.biometricEnabled) }
    }

    // MARK: - Sync

    var lastSyncDate: Date? {
        get { defaults.object(forKey: Keys.lastSyncDate) as? Date }
        set { defaults.set(newValue, forKey: Keys.lastSyncDate) }
    }

    // MARK: - Cache Methods

    func cacheAppointments(_ appointments: [Appointment]) {
        save(appointments, forKey: Keys.cachedAppointments)
    }

    func getCachedAppointments() -> [Appointment]? {
        get(forKey: Keys.cachedAppointments)
    }

    func cacheMessages(_ messages: [Message]) {
        save(messages, forKey: Keys.cachedMessages)
    }

    func getCachedMessages() -> [Message]? {
        get(forKey: Keys.cachedMessages)
    }

    // MARK: - Offline Queue

    func addToOfflineQueue(_ request: OfflineRequest) {
        var queue = getOfflineQueue()
        queue.append(request)
        save(queue, forKey: Keys.offlineQueue)
    }

    func getOfflineQueue() -> [OfflineRequest] {
        get(forKey: Keys.offlineQueue) ?? []
    }

    func clearOfflineQueue() {
        defaults.removeObject(forKey: Keys.offlineQueue)
    }

    func removeFromOfflineQueue(_ id: String) {
        var queue = getOfflineQueue()
        queue.removeAll { $0.id == id }
        save(queue, forKey: Keys.offlineQueue)
    }

    // MARK: - Clear All

    func clearAll() {
        let domain = Bundle.main.bundleIdentifier!
        defaults.removePersistentDomain(forName: domain)
    }

    // MARK: - Private Helpers

    private func save<T: Encodable>(_ value: T, forKey key: String) {
        guard let data = try? encoder.encode(value) else { return }
        defaults.set(data, forKey: key)
    }

    private func get<T: Decodable>(forKey key: String) -> T? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? decoder.decode(T.self, from: data)
    }
}

// MARK: - Offline Request

struct OfflineRequest: Codable, Identifiable {
    let id: String
    let endpoint: String
    let method: String
    let body: Data?
    let createdAt: Date

    init(endpoint: String, method: String, body: Data? = nil) {
        self.id = UUID().uuidString
        self.endpoint = endpoint
        self.method = method
        self.body = body
        self.createdAt = Date()
    }
}

// MARK: - Property Wrapper

@propertyWrapper
struct UserDefault<T> {
    let key: String
    let defaultValue: T

    var wrappedValue: T {
        get {
            UserDefaults.standard.object(forKey: key) as? T ?? defaultValue
        }
        set {
            UserDefaults.standard.set(newValue, forKey: key)
        }
    }
}

@propertyWrapper
struct CodableUserDefault<T: Codable> {
    let key: String
    let defaultValue: T

    var wrappedValue: T {
        get {
            guard let data = UserDefaults.standard.data(forKey: key),
                  let value = try? JSONDecoder().decode(T.self, from: data) else {
                return defaultValue
            }
            return value
        }
        set {
            guard let data = try? JSONEncoder().encode(newValue) else { return }
            UserDefaults.standard.set(data, forKey: key)
        }
    }
}
