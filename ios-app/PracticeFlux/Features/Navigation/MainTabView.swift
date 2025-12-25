import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var appState: AppState
    @State private var selectedTab: Tab = .home

    enum Tab: String, CaseIterable {
        case home = "Home"
        case appointments = "Appointments"
        case records = "Records"
        case messages = "Messages"
        case profile = "Profile"

        var icon: String {
            switch self {
            case .home: return "house"
            case .appointments: return "calendar"
            case .records: return "doc.text"
            case .messages: return "envelope"
            case .profile: return "person"
            }
        }

        var selectedIcon: String {
            switch self {
            case .home: return "house.fill"
            case .appointments: return "calendar.circle.fill"
            case .records: return "doc.text.fill"
            case .messages: return "envelope.fill"
            case .profile: return "person.fill"
            }
        }
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label(Tab.home.rawValue, systemImage: tabIcon(for: .home))
                }
                .tag(Tab.home)

            AppointmentsView()
                .tabItem {
                    Label(Tab.appointments.rawValue, systemImage: tabIcon(for: .appointments))
                }
                .tag(Tab.appointments)

            RecordsView()
                .tabItem {
                    Label(Tab.records.rawValue, systemImage: tabIcon(for: .records))
                }
                .tag(Tab.records)

            MessagesView()
                .tabItem {
                    Label(Tab.messages.rawValue, systemImage: tabIcon(for: .messages))
                }
                .tag(Tab.messages)
                .badge(appState.unreadMessageCount > 0 ? appState.unreadMessageCount : 0)

            ProfileView()
                .tabItem {
                    Label(Tab.profile.rawValue, systemImage: tabIcon(for: .profile))
                }
                .tag(Tab.profile)
        }
        .tint(.healthPrimary)
    }

    private func tabIcon(for tab: Tab) -> String {
        selectedTab == tab ? tab.selectedIcon : tab.icon
    }
}

// MARK: - Preview

#Preview {
    MainTabView()
        .environmentObject(AuthManager.shared)
        .environmentObject(AppState.shared)
}
