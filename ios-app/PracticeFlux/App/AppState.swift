import SwiftUI
import Combine

/// Global application state
@MainActor
final class AppState: ObservableObject {
    static let shared = AppState()

    // MARK: - Published Properties

    @Published var colorScheme: ColorScheme? = nil
    @Published var isOnline: Bool = true
    @Published var hasUnreadMessages: Bool = false
    @Published var unreadMessageCount: Int = 0
    @Published var pendingNotifications: Int = 0

    // MARK: - App Configuration

    struct Configuration {
        static let apiBaseURL = "https://api.practiceflux.com/v1"
        static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        static let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        static let sessionTimeoutMinutes: Int = 15
        static let biometricAuthEnabled: Bool = true
    }

    // MARK: - Initialization

    private init() {
        loadUserPreferences()
        setupNetworkMonitoring()
    }

    // MARK: - User Preferences

    private func loadUserPreferences() {
        if let themeMode = UserDefaults.standard.string(forKey: "themeMode") {
            switch themeMode {
            case "light":
                colorScheme = .light
            case "dark":
                colorScheme = .dark
            default:
                colorScheme = nil // System default
            }
        }
    }

    func setThemeMode(_ mode: ThemeMode) {
        switch mode {
        case .system:
            colorScheme = nil
            UserDefaults.standard.set("system", forKey: "themeMode")
        case .light:
            colorScheme = .light
            UserDefaults.standard.set("light", forKey: "themeMode")
        case .dark:
            colorScheme = .dark
            UserDefaults.standard.set("dark", forKey: "themeMode")
        }
    }

    // MARK: - Network Monitoring

    private func setupNetworkMonitoring() {
        // In a real app, use NWPathMonitor
        isOnline = true
    }

    // MARK: - Badge Updates

    func updateUnreadMessages(count: Int) {
        unreadMessageCount = count
        hasUnreadMessages = count > 0
    }

    func updatePendingNotifications(count: Int) {
        pendingNotifications = count
    }
}

// MARK: - Theme Mode

enum ThemeMode: String, CaseIterable, Identifiable {
    case system = "System"
    case light = "Light"
    case dark = "Dark"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .system: return "circle.lefthalf.filled"
        case .light: return "sun.max.fill"
        case .dark: return "moon.fill"
        }
    }
}
