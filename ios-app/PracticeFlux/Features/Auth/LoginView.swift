import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var authManager: AuthManager

    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showBiometricPrompt = false

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Logo and Welcome
                VStack(spacing: 16) {
                    Image(systemName: "cross.case.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(.linearGradient(
                            colors: [.healthPrimary, .healthSecondary],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))

                    VStack(spacing: 8) {
                        Text("Welcome Back")
                            .font(.headlineMedium)
                            .foregroundColor(.textPrimary)

                        Text("Sign in to access your health records")
                            .font(.bodyMedium)
                            .foregroundColor(.textSecondary)
                    }
                }
                .padding(.top, 48)

                // Login Form
                VStack(spacing: 20) {
                    PFTextField(
                        title: "Email",
                        placeholder: "Enter your email",
                        text: $email,
                        icon: "envelope",
                        keyboardType: .emailAddress,
                        textContentType: .emailAddress
                    )

                    PFTextField(
                        title: "Password",
                        placeholder: "Enter your password",
                        text: $password,
                        icon: "lock",
                        textContentType: .password,
                        isSecure: true
                    )

                    // Forgot Password
                    HStack {
                        Spacer()
                        TextButton("Forgot Password?") {
                            // Handle forgot password
                        }
                    }
                }

                // Error Message
                if let error = errorMessage {
                    Text(error)
                        .font(.bodySmall)
                        .foregroundColor(.error)
                        .padding(.horizontal)
                        .multilineTextAlignment(.center)
                }

                // Login Button
                VStack(spacing: 16) {
                    PrimaryButton(
                        "Sign In",
                        icon: "arrow.right",
                        isLoading: isLoading,
                        isDisabled: !isFormValid
                    ) {
                        Task {
                            await login()
                        }
                    }

                    // Biometric Login
                    if authManager.isBiometricAvailable && authManager.isBiometricEnabled {
                        LabeledDivider(label: "or")

                        SecondaryButton(
                            "Sign in with \(authManager.biometricType.displayName)",
                            icon: authManager.biometricType.icon
                        ) {
                            Task {
                                await loginWithBiometric()
                            }
                        }
                    }
                }

                Spacer()

                // Sign Up Link
                HStack(spacing: 4) {
                    Text("Don't have an account?")
                        .font(.bodyMedium)
                        .foregroundColor(.textSecondary)

                    TextButton("Sign Up") {
                        // Handle sign up
                    }
                }
                .padding(.bottom, 32)
            }
            .padding(.horizontal, 24)
        }
        .background(Color.backgroundPrimary)
    }

    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && email.contains("@")
    }

    private func login() async {
        isLoading = true
        errorMessage = nil

        do {
            try await authManager.login(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    private func loginWithBiometric() async {
        isLoading = true
        errorMessage = nil

        do {
            try await authManager.loginWithBiometric()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

// MARK: - Preview

#Preview {
    LoginView()
        .environmentObject(AuthManager.shared)
}
