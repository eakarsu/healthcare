import SwiftUI

// MARK: - Avatar View

struct AvatarView: View {
    let initials: String
    let imageUrl: String?
    var size: CGFloat = 40
    var backgroundColor: Color = .healthPrimary

    var body: some View {
        Group {
            if let urlString = imageUrl, let url = URL(string: urlString) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure:
                        initialsView
                    case .empty:
                        ProgressView()
                    @unknown default:
                        initialsView
                    }
                }
            } else {
                initialsView
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }

    private var initialsView: some View {
        Text(initials)
            .font(.system(size: size * 0.4, weight: .semibold))
            .foregroundColor(.white)
            .frame(width: size, height: size)
            .background(Circle().fill(backgroundColor))
    }
}

// MARK: - Status Badge

struct StatusBadge: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text)
            .font(.captionMedium)
            .fontWeight(.medium)
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(color.opacity(0.1))
            )
    }
}

// MARK: - Badge

struct Badge: View {
    let count: Int
    var maxCount: Int = 99

    var body: some View {
        Text(count > maxCount ? "\(maxCount)+" : "\(count)")
            .font(.captionSmall)
            .fontWeight(.bold)
            .foregroundColor(.white)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(
                Capsule()
                    .fill(Color.red)
            )
    }
}

// MARK: - Empty State View

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 64))
                .foregroundColor(.textTertiary)

            VStack(spacing: 8) {
                Text(title)
                    .font(.titleMedium)
                    .foregroundColor(.textPrimary)

                Text(message)
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            if let actionTitle = actionTitle, let action = action {
                PrimaryButton(actionTitle, action: action)
                    .frame(width: 200)
            }
        }
        .padding(32)
    }
}

// MARK: - Loading View

struct LoadingView: View {
    var message: String = "Loading..."

    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)

            Text(message)
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)
        }
    }
}

// MARK: - Error View

struct ErrorView: View {
    let error: Error
    var retryAction: (() -> Void)?

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.error)

            VStack(spacing: 8) {
                Text("Something went wrong")
                    .font(.titleMedium)
                    .foregroundColor(.textPrimary)

                Text(error.localizedDescription)
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            if let retry = retryAction {
                SecondaryButton("Try Again", icon: "arrow.clockwise", action: retry)
                    .frame(width: 160)
            }
        }
        .padding(32)
    }
}

// MARK: - Section Header

struct SectionHeader: View {
    let title: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        HStack {
            Text(title)
                .font(.titleSmall)
                .foregroundColor(.textPrimary)

            Spacer()

            if let actionTitle = actionTitle, let action = action {
                TextButton(actionTitle, action: action)
            }
        }
    }
}

// MARK: - Divider with Label

struct LabeledDivider: View {
    let label: String

    var body: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(Color.separator)
                .frame(height: 1)

            Text(label)
                .font(.captionMedium)
                .foregroundColor(.textTertiary)

            Rectangle()
                .fill(Color.separator)
                .frame(height: 1)
        }
    }
}

// MARK: - Info Row

struct InfoRow: View {
    let label: String
    let value: String
    var icon: String?

    var body: some View {
        HStack {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.bodyMedium)
                    .foregroundColor(.textTertiary)
                    .frame(width: 24)
            }

            Text(label)
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)

            Spacer()

            Text(value)
                .font(.bodyMedium)
                .foregroundColor(.textPrimary)
        }
    }
}

// MARK: - Toggle Row

struct ToggleRow: View {
    let title: String
    let subtitle: String?
    var icon: String?
    @Binding var isOn: Bool

    init(
        _ title: String,
        subtitle: String? = nil,
        icon: String? = nil,
        isOn: Binding<Bool>
    ) {
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self._isOn = isOn
    }

    var body: some View {
        Toggle(isOn: $isOn) {
            HStack(spacing: 12) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.bodyLarge)
                        .foregroundColor(.healthPrimary)
                        .frame(width: 28)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.bodyMedium)
                        .foregroundColor(.textPrimary)

                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.captionMedium)
                            .foregroundColor(.textSecondary)
                    }
                }
            }
        }
        .tint(.healthPrimary)
    }
}

// MARK: - Navigation Row

struct NavigationRow: View {
    let title: String
    let subtitle: String?
    var icon: String?
    var iconColor: Color = .healthPrimary
    var showChevron: Bool = true

    init(
        _ title: String,
        subtitle: String? = nil,
        icon: String? = nil,
        iconColor: Color = .healthPrimary,
        showChevron: Bool = true
    ) {
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self.iconColor = iconColor
        self.showChevron = showChevron
    }

    var body: some View {
        HStack(spacing: 12) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.bodyLarge)
                    .foregroundColor(iconColor)
                    .frame(width: 28)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.bodyMedium)
                    .foregroundColor(.textPrimary)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.captionMedium)
                        .foregroundColor(.textSecondary)
                }
            }

            Spacer()

            if showChevron {
                Image(systemName: "chevron.right")
                    .font(.captionLarge)
                    .foregroundColor(.textTertiary)
            }
        }
        .contentShape(Rectangle())
    }
}
