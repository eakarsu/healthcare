import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var authManager: AuthManager
    @EnvironmentObject private var appState: AppState

    @StateObject private var viewModel = HomeViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Welcome Header
                    welcomeHeader

                    // Quick Actions
                    quickActions

                    // Upcoming Appointments
                    upcomingAppointments

                    // Recent Messages
                    recentMessages

                    // Health Summary
                    healthSummary
                }
                .padding()
            }
            .background(Color.backgroundPrimary)
            .navigationTitle("Home")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    notificationButton
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
        }
        .task {
            await viewModel.loadData()
        }
    }

    // MARK: - Welcome Header

    private var welcomeHeader: some View {
        HStack(spacing: 16) {
            if let user = authManager.currentUser {
                AvatarView(
                    initials: user.initials,
                    imageUrl: user.avatarUrl,
                    size: 56
                )

                VStack(alignment: .leading, spacing: 4) {
                    Text(greeting)
                        .font(.bodyMedium)
                        .foregroundColor(.textSecondary)

                    Text(user.firstName)
                        .font(.headlineSmall)
                        .foregroundColor(.textPrimary)
                }
            }

            Spacer()
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(LinearGradient.primaryGradient.opacity(0.1))
        )
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12: return "Good morning,"
        case 12..<17: return "Good afternoon,"
        default: return "Good evening,"
        }
    }

    // MARK: - Quick Actions

    private var quickActions: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Quick Actions")

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                QuickActionButton(
                    icon: "calendar.badge.plus",
                    title: "Book",
                    color: .healthPrimary
                ) {
                    // Navigate to book appointment
                }

                QuickActionButton(
                    icon: "envelope",
                    title: "Message",
                    color: .healthSecondary
                ) {
                    // Navigate to messages
                }

                QuickActionButton(
                    icon: "doc.text",
                    title: "Records",
                    color: .healthAccent
                ) {
                    // Navigate to records
                }

                QuickActionButton(
                    icon: "creditcard",
                    title: "Pay",
                    color: .success
                ) {
                    // Navigate to payments
                }
            }
        }
    }

    // MARK: - Upcoming Appointments

    private var upcomingAppointments: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Upcoming Appointments", actionTitle: "See All") {
                // Navigate to appointments
            }

            if viewModel.isLoadingAppointments {
                LoadingView()
                    .frame(height: 150)
            } else if viewModel.upcomingAppointments.isEmpty {
                EmptyStateView(
                    icon: "calendar",
                    title: "No Upcoming Appointments",
                    message: "Book an appointment to get started",
                    actionTitle: "Book Now"
                ) {
                    // Navigate to book
                }
            } else {
                ForEach(viewModel.upcomingAppointments.prefix(2)) { appointment in
                    AppointmentCard(
                        appointment: appointment,
                        onTap: {
                            // Navigate to appointment detail
                        }
                    )
                }
            }
        }
    }

    // MARK: - Recent Messages

    private var recentMessages: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Recent Messages", actionTitle: "See All") {
                // Navigate to messages
            }

            if viewModel.isLoadingMessages {
                LoadingView()
                    .frame(height: 100)
            } else if viewModel.recentConversations.isEmpty {
                CardContainer {
                    HStack {
                        Image(systemName: "envelope")
                            .font(.title2)
                            .foregroundColor(.textTertiary)

                        Text("No messages yet")
                            .font(.bodyMedium)
                            .foregroundColor(.textSecondary)

                        Spacer()
                    }
                }
            } else {
                ForEach(viewModel.recentConversations.prefix(2)) { conversation in
                    MessageCard(conversation: conversation) {
                        // Navigate to conversation
                    }
                }
            }
        }
    }

    // MARK: - Health Summary

    private var healthSummary: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Health Summary")

            CardContainer {
                VStack(spacing: 16) {
                    if let vitals = viewModel.latestVitals {
                        HStack(spacing: 24) {
                            VitalItem(
                                icon: "heart.fill",
                                value: vitals.heartRate.map { "\($0)" } ?? "--",
                                unit: "bpm",
                                label: "Heart Rate",
                                color: .red
                            )

                            VitalItem(
                                icon: "drop.fill",
                                value: vitals.bloodPressure ?? "--",
                                unit: "",
                                label: "Blood Pressure",
                                color: .blue
                            )

                            VitalItem(
                                icon: "scalemass.fill",
                                value: vitals.weight.map { String(format: "%.1f", $0) } ?? "--",
                                unit: "kg",
                                label: "Weight",
                                color: .green
                            )
                        }
                    } else {
                        HStack {
                            Image(systemName: "heart.text.square")
                                .font(.title2)
                                .foregroundColor(.textTertiary)

                            Text("No vitals recorded yet")
                                .font(.bodyMedium)
                                .foregroundColor(.textSecondary)

                            Spacer()
                        }
                    }
                }
            }
        }
    }

    // MARK: - Notification Button

    private var notificationButton: some View {
        Button {
            // Navigate to notifications
        } label: {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "bell")
                    .font(.title3)

                if appState.pendingNotifications > 0 {
                    Badge(count: appState.pendingNotifications)
                        .offset(x: 8, y: -8)
                }
            }
        }
    }
}

// MARK: - Quick Action Button

struct QuickActionButton: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                    .frame(width: 56, height: 56)
                    .background(
                        Circle()
                            .fill(color.opacity(0.1))
                    )

                Text(title)
                    .font(.captionMedium)
                    .foregroundColor(.textSecondary)
            }
        }
        .buttonStyle(.scale)
    }
}

// MARK: - Vital Item

struct VitalItem: View {
    let icon: String
    let value: String
    let unit: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)

            HStack(spacing: 2) {
                Text(value)
                    .font(.titleMedium)
                    .foregroundColor(.textPrimary)

                Text(unit)
                    .font(.captionMedium)
                    .foregroundColor(.textSecondary)
            }

            Text(label)
                .font(.captionSmall)
                .foregroundColor(.textTertiary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Home View Model

@MainActor
class HomeViewModel: ObservableObject {
    @Published var upcomingAppointments: [Appointment] = []
    @Published var recentConversations: [Conversation] = []
    @Published var latestVitals: VitalSigns?
    @Published var isLoadingAppointments = false
    @Published var isLoadingMessages = false

    private let apiClient = APIClient.shared

    func loadData() async {
        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.loadAppointments() }
            group.addTask { await self.loadConversations() }
            group.addTask { await self.loadVitals() }
        }
    }

    func refresh() async {
        await loadData()
    }

    private func loadAppointments() async {
        isLoadingAppointments = true
        do {
            let response: PaginatedResponse<Appointment> = try await apiClient.request(
                endpoint: .appointments(status: .scheduled),
                responseType: PaginatedResponse<Appointment>.self
            )
            upcomingAppointments = response.data
        } catch {
            print("Failed to load appointments: \(error)")
        }
        isLoadingAppointments = false
    }

    private func loadConversations() async {
        isLoadingMessages = true
        do {
            let response: PaginatedResponse<Conversation> = try await apiClient.request(
                endpoint: .conversations(),
                responseType: PaginatedResponse<Conversation>.self
            )
            recentConversations = response.data
        } catch {
            print("Failed to load conversations: \(error)")
        }
        isLoadingMessages = false
    }

    private func loadVitals() async {
        do {
            latestVitals = try await apiClient.request(
                endpoint: .latestVitals,
                responseType: VitalSigns.self
            )
        } catch {
            print("Failed to load vitals: \(error)")
        }
    }
}

// MARK: - Paginated Response

struct PaginatedResponse<T: Decodable>: Decodable {
    let data: [T]
    let meta: PaginationMeta
}

struct PaginationMeta: Decodable {
    let currentPage: Int
    let totalPages: Int
    let totalItems: Int
    let itemsPerPage: Int

    enum CodingKeys: String, CodingKey {
        case currentPage = "current_page"
        case totalPages = "total_pages"
        case totalItems = "total_items"
        case itemsPerPage = "items_per_page"
    }
}

// MARK: - Preview

#Preview {
    HomeView()
        .environmentObject(AuthManager.shared)
        .environmentObject(AppState.shared)
}
