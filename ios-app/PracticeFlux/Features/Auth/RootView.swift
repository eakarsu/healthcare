import SwiftUI

struct RootView: View {
    @EnvironmentObject private var authManager: AuthManager
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
        .animation(.easeInOut, value: authManager.isAuthenticated)
    }
}

// MARK: - Preview

#Preview {
    RootView()
        .environmentObject(AuthManager.shared)
        .environmentObject(AppState.shared)
}
