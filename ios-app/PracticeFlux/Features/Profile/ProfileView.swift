import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var authManager: AuthManager
    @EnvironmentObject private var appState: AppState
    @State private var showLogoutAlert = false

    var body: some View {
        NavigationStack {
            List {
                // Profile Header
                Section {
                    profileHeader
                }

                // Account Settings
                Section("Account") {
                    NavigationLink {
                        EditProfileView()
                    } label: {
                        NavigationRow("Edit Profile", icon: "person", showChevron: false)
                    }

                    NavigationLink {
                        ChangePasswordView()
                    } label: {
                        NavigationRow("Change Password", icon: "lock", showChevron: false)
                    }

                    if authManager.isBiometricAvailable {
                        ToggleRow(
                            "Use \(authManager.biometricType.displayName)",
                            subtitle: "Quick login with biometrics",
                            icon: authManager.biometricType.icon,
                            isOn: Binding(
                                get: { authManager.isBiometricEnabled },
                                set: { enabled in
                                    Task {
                                        if enabled {
                                            try? await authManager.enableBiometric()
                                        } else {
                                            authManager.disableBiometric()
                                        }
                                    }
                                }
                            )
                        )
                    }
                }

                // Preferences
                Section("Preferences") {
                    NavigationLink {
                        ThemeSettingsView()
                    } label: {
                        NavigationRow("Appearance", subtitle: currentThemeName, icon: "paintbrush", showChevron: false)
                    }

                    NavigationLink {
                        NotificationSettingsView()
                    } label: {
                        NavigationRow("Notifications", icon: "bell", showChevron: false)
                    }
                }

                // Support
                Section("Support") {
                    NavigationLink {
                        // Help Center
                    } label: {
                        NavigationRow("Help Center", icon: "questionmark.circle", showChevron: false)
                    }

                    NavigationLink {
                        // Contact Support
                    } label: {
                        NavigationRow("Contact Support", icon: "envelope", showChevron: false)
                    }

                    NavigationLink {
                        // Privacy Policy
                    } label: {
                        NavigationRow("Privacy Policy", icon: "hand.raised", showChevron: false)
                    }

                    NavigationLink {
                        // Terms of Service
                    } label: {
                        NavigationRow("Terms of Service", icon: "doc.text", showChevron: false)
                    }
                }

                // About
                Section("About") {
                    InfoRow(label: "Version", value: AppState.Configuration.appVersion)
                    InfoRow(label: "Build", value: AppState.Configuration.buildNumber)
                }

                // Logout
                Section {
                    Button {
                        showLogoutAlert = true
                    } label: {
                        HStack {
                            Spacer()
                            Text("Log Out")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Profile")
            .alert("Log Out", isPresented: $showLogoutAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Log Out", role: .destructive) {
                    Task {
                        await authManager.logout()
                    }
                }
            } message: {
                Text("Are you sure you want to log out?")
            }
        }
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        HStack(spacing: 16) {
            if let user = authManager.currentUser {
                AvatarView(
                    initials: user.initials,
                    imageUrl: user.avatarUrl,
                    size: 72
                )

                VStack(alignment: .leading, spacing: 4) {
                    Text(user.fullName)
                        .font(.titleMedium)
                        .foregroundColor(.textPrimary)

                    Text(user.email)
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)

                    StatusBadge(text: user.role.displayName, color: .healthPrimary)
                }
            }

            Spacer()
        }
        .padding(.vertical, 8)
    }

    private var currentThemeName: String {
        switch appState.colorScheme {
        case .light: return "Light"
        case .dark: return "Dark"
        case .none: return "System"
        @unknown default: return "System"
        }
    }
}

// MARK: - Edit Profile View

struct EditProfileView: View {
    @EnvironmentObject private var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phone = ""
    @State private var isLoading = false

    var body: some View {
        Form {
            Section("Personal Information") {
                PFTextField(
                    title: "First Name",
                    placeholder: "Enter first name",
                    text: $firstName
                )

                PFTextField(
                    title: "Last Name",
                    placeholder: "Enter last name",
                    text: $lastName
                )

                PFTextField(
                    title: "Phone",
                    placeholder: "Enter phone number",
                    text: $phone,
                    keyboardType: .phonePad
                )
            }
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Save") {
                    Task {
                        await saveProfile()
                    }
                }
                .disabled(isLoading)
            }
        }
        .onAppear {
            if let user = authManager.currentUser {
                firstName = user.firstName
                lastName = user.lastName
                phone = user.phone ?? ""
            }
        }
    }

    private func saveProfile() async {
        guard let user = authManager.currentUser else { return }

        isLoading = true

        // Create updated user (in real app, would use proper update model)
        let updatedUser = User(
            id: user.id,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            phone: phone.isEmpty ? nil : phone,
            dateOfBirth: user.dateOfBirth,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: Date()
        )

        do {
            try await authManager.updateProfile(updatedUser)
            dismiss()
        } catch {
            print("Failed to update profile: \(error)")
        }

        isLoading = false
    }
}

// MARK: - Change Password View

struct ChangePasswordView: View {
    @EnvironmentObject private var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss

    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        Form {
            Section {
                PFTextField(
                    title: "Current Password",
                    placeholder: "Enter current password",
                    text: $currentPassword,
                    isSecure: true
                )

                PFTextField(
                    title: "New Password",
                    placeholder: "Enter new password",
                    text: $newPassword,
                    isSecure: true
                )

                PFTextField(
                    title: "Confirm Password",
                    placeholder: "Confirm new password",
                    text: $confirmPassword,
                    isSecure: true,
                    errorMessage: passwordMismatchError
                )
            }

            if let error = errorMessage {
                Section {
                    Text(error)
                        .foregroundColor(.red)
                }
            }
        }
        .navigationTitle("Change Password")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Save") {
                    Task {
                        await changePassword()
                    }
                }
                .disabled(!isFormValid || isLoading)
            }
        }
    }

    private var passwordMismatchError: String? {
        if !confirmPassword.isEmpty && newPassword != confirmPassword {
            return "Passwords do not match"
        }
        return nil
    }

    private var isFormValid: Bool {
        !currentPassword.isEmpty &&
        newPassword.count >= 8 &&
        newPassword == confirmPassword
    }

    private func changePassword() async {
        isLoading = true
        errorMessage = nil

        do {
            try await authManager.changePassword(
                currentPassword: currentPassword,
                newPassword: newPassword
            )
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

// MARK: - Theme Settings View

struct ThemeSettingsView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        List {
            ForEach(ThemeMode.allCases) { mode in
                Button {
                    appState.setThemeMode(mode)
                } label: {
                    HStack {
                        Image(systemName: mode.icon)
                            .font(.title3)
                            .foregroundColor(.healthPrimary)
                            .frame(width: 32)

                        Text(mode.rawValue)
                            .foregroundColor(.textPrimary)

                        Spacer()

                        if isSelected(mode) {
                            Image(systemName: "checkmark")
                                .foregroundColor(.healthPrimary)
                        }
                    }
                }
            }
        }
        .navigationTitle("Appearance")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func isSelected(_ mode: ThemeMode) -> Bool {
        switch mode {
        case .system: return appState.colorScheme == nil
        case .light: return appState.colorScheme == .light
        case .dark: return appState.colorScheme == .dark
        }
    }
}

// MARK: - Notification Settings View

struct NotificationSettingsView: View {
    @State private var appointmentReminders = true
    @State private var messageNotifications = true
    @State private var labResults = true
    @State private var paymentReminders = true
    @State private var marketingEmails = false

    var body: some View {
        List {
            Section("Push Notifications") {
                Toggle("Appointment Reminders", isOn: $appointmentReminders)
                Toggle("New Messages", isOn: $messageNotifications)
                Toggle("Lab Results Available", isOn: $labResults)
                Toggle("Payment Reminders", isOn: $paymentReminders)
            }

            Section("Email") {
                Toggle("Marketing & Updates", isOn: $marketingEmails)
            }
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Preview

#Preview {
    ProfileView()
        .environmentObject(AuthManager.shared)
        .environmentObject(AppState.shared)
}
