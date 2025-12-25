import SwiftUI

struct AppointmentsView: View {
    @StateObject private var viewModel = AppointmentsViewModel()
    @State private var selectedFilter: AppointmentFilter = .upcoming
    @State private var showBooking = false

    enum AppointmentFilter: String, CaseIterable {
        case upcoming = "Upcoming"
        case past = "Past"
        case all = "All"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter Tabs
                filterTabs

                // Content
                content
            }
            .background(Color.backgroundPrimary)
            .navigationTitle("Appointments")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showBooking = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showBooking) {
                BookAppointmentView()
            }
            .refreshable {
                await viewModel.loadAppointments()
            }
        }
        .task {
            await viewModel.loadAppointments()
        }
    }

    // MARK: - Filter Tabs

    private var filterTabs: some View {
        HStack(spacing: 8) {
            ForEach(AppointmentFilter.allCases, id: \.self) { filter in
                ChipButton(
                    filter.rawValue,
                    isSelected: selectedFilter == filter
                ) {
                    selectedFilter = filter
                }
            }

            Spacer()
        }
        .padding()
    }

    // MARK: - Content

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading {
            LoadingView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if filteredAppointments.isEmpty {
            EmptyStateView(
                icon: "calendar",
                title: emptyTitle,
                message: emptyMessage,
                actionTitle: selectedFilter == .upcoming ? "Book Appointment" : nil
            ) {
                showBooking = true
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(filteredAppointments) { appointment in
                        AppointmentCard(
                            appointment: appointment,
                            onTap: {
                                viewModel.selectedAppointment = appointment
                            },
                            onAction: { action in
                                handleAction(action, for: appointment)
                            }
                        )
                    }
                }
                .padding()
            }
        }
    }

    private var filteredAppointments: [Appointment] {
        switch selectedFilter {
        case .upcoming:
            return viewModel.appointments.filter { $0.isUpcoming }
        case .past:
            return viewModel.appointments.filter { $0.isPast }
        case .all:
            return viewModel.appointments
        }
    }

    private var emptyTitle: String {
        switch selectedFilter {
        case .upcoming: return "No Upcoming Appointments"
        case .past: return "No Past Appointments"
        case .all: return "No Appointments"
        }
    }

    private var emptyMessage: String {
        switch selectedFilter {
        case .upcoming: return "Schedule your next visit with your healthcare provider"
        case .past: return "Your past appointments will appear here"
        case .all: return "Book your first appointment to get started"
        }
    }

    private func handleAction(_ action: AppointmentCard.AppointmentCardAction, for appointment: Appointment) {
        switch action {
        case .reschedule:
            viewModel.appointmentToReschedule = appointment
        case .cancel:
            viewModel.appointmentToCancel = appointment
        case .joinVirtual:
            if let url = appointment.virtualMeetingUrl.flatMap(URL.init) {
                UIApplication.shared.open(url)
            }
        }
    }
}

// MARK: - Appointments View Model

@MainActor
class AppointmentsViewModel: ObservableObject {
    @Published var appointments: [Appointment] = []
    @Published var isLoading = false
    @Published var error: Error?
    @Published var selectedAppointment: Appointment?
    @Published var appointmentToReschedule: Appointment?
    @Published var appointmentToCancel: Appointment?

    private let apiClient = APIClient.shared

    func loadAppointments() async {
        isLoading = true
        error = nil

        do {
            let response: PaginatedResponse<Appointment> = try await apiClient.request(
                endpoint: .appointments(limit: 50),
                responseType: PaginatedResponse<Appointment>.self
            )
            appointments = response.data.sorted { $0.startTime > $1.startTime }
        } catch {
            self.error = error
        }

        isLoading = false
    }

    func cancelAppointment(_ appointment: Appointment, reason: String?) async throws {
        try await apiClient.request(
            endpoint: .cancelAppointment(id: appointment.id, reason: reason)
        )
        await loadAppointments()
    }

    func confirmAppointment(_ appointment: Appointment) async throws {
        try await apiClient.request(
            endpoint: .confirmAppointment(id: appointment.id)
        )
        await loadAppointments()
    }
}

// MARK: - Book Appointment View

struct BookAppointmentView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = BookAppointmentViewModel()

    var body: some View {
        NavigationStack {
            Form {
                // Appointment Type
                Section("Appointment Type") {
                    Picker("Type", selection: $viewModel.selectedType) {
                        ForEach(AppointmentType.allCases, id: \.self) { type in
                            Label(type.displayName, systemImage: type.icon)
                                .tag(type)
                        }
                    }
                    .pickerStyle(.menu)
                }

                // Provider
                Section("Select Provider") {
                    if viewModel.isLoadingProviders {
                        ProgressView()
                    } else {
                        ForEach(viewModel.providers) { provider in
                            Button {
                                viewModel.selectedProvider = provider
                            } label: {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(provider.displayName)
                                            .foregroundColor(.textPrimary)
                                        Text(provider.specialty)
                                            .font(.captionMedium)
                                            .foregroundColor(.textSecondary)
                                    }

                                    Spacer()

                                    if viewModel.selectedProvider?.id == provider.id {
                                        Image(systemName: "checkmark")
                                            .foregroundColor(.healthPrimary)
                                    }
                                }
                            }
                        }
                    }
                }

                // Date and Time
                if viewModel.selectedProvider != nil {
                    Section("Date & Time") {
                        DatePicker(
                            "Select Date",
                            selection: $viewModel.selectedDate,
                            in: Date()...,
                            displayedComponents: .date
                        )

                        if viewModel.isLoadingSlots {
                            ProgressView()
                        } else if viewModel.availableSlots.isEmpty {
                            Text("No available slots for this date")
                                .foregroundColor(.textSecondary)
                        } else {
                            LazyVGrid(columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ], spacing: 8) {
                                ForEach(viewModel.availableSlots, id: \.self) { slot in
                                    Button {
                                        viewModel.selectedSlot = slot
                                    } label: {
                                        Text(formatTime(slot))
                                            .font(.labelMedium)
                                            .padding(.vertical, 8)
                                            .padding(.horizontal, 12)
                                            .frame(maxWidth: .infinity)
                                            .background(
                                                RoundedRectangle(cornerRadius: 8)
                                                    .fill(viewModel.selectedSlot == slot ? Color.healthPrimary : Color.backgroundSecondary)
                                            )
                                            .foregroundColor(viewModel.selectedSlot == slot ? .white : .textPrimary)
                                    }
                                }
                            }
                        }
                    }
                }

                // Virtual Visit
                Section {
                    Toggle("Virtual Visit", isOn: $viewModel.isVirtual)
                }

                // Reason
                Section("Reason for Visit") {
                    TextEditor(text: $viewModel.reason)
                        .frame(minHeight: 80)
                }
            }
            .navigationTitle("Book Appointment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Book") {
                        Task {
                            await viewModel.bookAppointment()
                            dismiss()
                        }
                    }
                    .disabled(!viewModel.canBook)
                }
            }
        }
        .task {
            await viewModel.loadProviders()
        }
        .onChange(of: viewModel.selectedDate) { _, _ in
            Task {
                await viewModel.loadAvailableSlots()
            }
        }
        .onChange(of: viewModel.selectedProvider) { _, _ in
            Task {
                await viewModel.loadAvailableSlots()
            }
        }
    }

    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Book Appointment View Model

@MainActor
class BookAppointmentViewModel: ObservableObject {
    @Published var selectedType: AppointmentType = .checkup
    @Published var selectedProvider: Provider?
    @Published var selectedDate = Date()
    @Published var selectedSlot: Date?
    @Published var isVirtual = false
    @Published var reason = ""

    @Published var providers: [Provider] = []
    @Published var availableSlots: [Date] = []
    @Published var isLoadingProviders = false
    @Published var isLoadingSlots = false

    private let apiClient = APIClient.shared

    var canBook: Bool {
        selectedProvider != nil && selectedSlot != nil
    }

    func loadProviders() async {
        isLoadingProviders = true
        do {
            providers = try await apiClient.request(
                endpoint: .providers,
                responseType: [Provider].self
            )
        } catch {
            print("Failed to load providers: \(error)")
        }
        isLoadingProviders = false
    }

    func loadAvailableSlots() async {
        guard let provider = selectedProvider else { return }

        isLoadingSlots = true
        do {
            availableSlots = try await apiClient.request(
                endpoint: .availableSlots(providerId: provider.id, date: selectedDate),
                responseType: [Date].self
            )
        } catch {
            print("Failed to load slots: \(error)")
        }
        isLoadingSlots = false
    }

    func bookAppointment() async {
        guard let provider = selectedProvider,
              let startTime = selectedSlot else { return }

        let endTime = startTime.addingTimeInterval(30 * 60) // 30 minutes

        let request = CreateAppointmentRequest(
            providerId: provider.id,
            locationId: nil,
            appointmentType: selectedType,
            startTime: startTime,
            endTime: endTime,
            reason: reason.isEmpty ? nil : reason,
            isVirtual: isVirtual
        )

        do {
            let _: Appointment = try await apiClient.request(
                endpoint: .createAppointment(request),
                responseType: Appointment.self
            )
        } catch {
            print("Failed to book appointment: \(error)")
        }
    }
}

// MARK: - Preview

#Preview {
    AppointmentsView()
}
