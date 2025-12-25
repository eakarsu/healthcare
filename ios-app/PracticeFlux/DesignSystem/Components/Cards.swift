import SwiftUI

// MARK: - Card Container

struct CardContainer<Content: View>: View {
    let content: Content
    var padding: CGFloat = 16
    var cornerRadius: CGFloat = 16

    init(
        padding: CGFloat = 16,
        cornerRadius: CGFloat = 16,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.padding = padding
        self.cornerRadius = cornerRadius
    }

    var body: some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Color.backgroundSecondary)
            )
    }
}

// MARK: - Elevated Card

struct ElevatedCard<Content: View>: View {
    let content: Content
    var padding: CGFloat = 16
    var cornerRadius: CGFloat = 16
    var shadowRadius: CGFloat = 8

    init(
        padding: CGFloat = 16,
        cornerRadius: CGFloat = 16,
        shadowRadius: CGFloat = 8,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.padding = padding
        self.cornerRadius = cornerRadius
        self.shadowRadius = shadowRadius
    }

    var body: some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Color.backgroundSecondary)
                    .shadow(color: .black.opacity(0.1), radius: shadowRadius, y: 4)
            )
    }
}

// MARK: - Appointment Card

struct AppointmentCard: View {
    let appointment: Appointment
    let onTap: () -> Void
    let onAction: ((AppointmentCardAction) -> Void)?

    enum AppointmentCardAction {
        case reschedule
        case cancel
        case joinVirtual
    }

    init(
        appointment: Appointment,
        onTap: @escaping () -> Void,
        onAction: ((AppointmentCardAction) -> Void)? = nil
    ) {
        self.appointment = appointment
        self.onTap = onTap
        self.onAction = onAction
    }

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                // Header
                HStack {
                    // Type Icon
                    Image(systemName: appointment.appointmentType.icon)
                        .font(.title3)
                        .foregroundColor(.healthPrimary)
                        .frame(width: 40, height: 40)
                        .background(
                            Circle()
                                .fill(Color.healthPrimary.opacity(0.1))
                        )

                    VStack(alignment: .leading, spacing: 2) {
                        Text(appointment.appointmentType.displayName)
                            .font(.titleSmall)
                            .foregroundColor(.textPrimary)

                        if let provider = appointment.provider {
                            Text(provider.displayName)
                                .font(.bodySmall)
                                .foregroundColor(.textSecondary)
                        }
                    }

                    Spacer()

                    // Status Badge
                    StatusBadge(
                        text: appointment.status.displayName,
                        color: statusColor(for: appointment.status)
                    )
                }

                Divider()

                // Date and Time
                HStack(spacing: 16) {
                    Label(appointment.formattedDate, systemImage: "calendar")
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)

                    Label(appointment.formattedTime, systemImage: "clock")
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                }

                // Location or Virtual
                if appointment.isVirtual {
                    Label("Virtual Visit", systemImage: "video")
                        .font(.bodySmall)
                        .foregroundColor(.healthPrimary)
                } else if let location = appointment.location {
                    Label(location.name, systemImage: "location")
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                }

                // Action Buttons
                if appointment.isUpcoming && onAction != nil {
                    HStack(spacing: 12) {
                        if appointment.isVirtual {
                            SecondaryButton("Join", icon: "video") {
                                onAction?(.joinVirtual)
                            }
                        }

                        TextButton("Reschedule", icon: "calendar.badge.clock") {
                            onAction?(.reschedule)
                        }

                        Spacer()

                        TextButton("Cancel", color: .red) {
                            onAction?(.cancel)
                        }
                    }
                }
            }
        }
        .buttonStyle(.scale)
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.backgroundSecondary)
        )
    }

    private func statusColor(for status: AppointmentStatus) -> Color {
        switch status {
        case .scheduled: return .blue
        case .confirmed: return .green
        case .checkedIn: return .purple
        case .inProgress: return .orange
        case .completed: return .gray
        case .cancelled, .noShow: return .red
        case .rescheduled: return .yellow
        }
    }
}

// MARK: - Message Card

struct MessageCard: View {
    let conversation: Conversation
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Avatar
                if let participant = conversation.otherParticipants.first {
                    AvatarView(
                        initials: participant.initials,
                        imageUrl: participant.avatarUrl,
                        size: 48
                    )
                }

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(conversation.displayName)
                            .font(.titleSmall)
                            .foregroundColor(.textPrimary)
                            .lineLimit(1)

                        Spacer()

                        if let lastMessage = conversation.lastMessage {
                            Text(lastMessage.formattedDate)
                                .font(.captionMedium)
                                .foregroundColor(.textTertiary)
                        }
                    }

                    if let lastMessage = conversation.lastMessage {
                        Text(lastMessage.preview)
                            .font(.bodySmall)
                            .foregroundColor(.textSecondary)
                            .lineLimit(2)
                    }
                }

                if conversation.unreadCount > 0 {
                    Badge(count: conversation.unreadCount)
                }
            }
        }
        .buttonStyle(.opacity)
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(conversation.unreadCount > 0 ? Color.healthPrimary.opacity(0.05) : Color.clear)
        )
    }
}

// MARK: - Invoice Card

struct InvoiceCard: View {
    let invoice: Invoice
    let onTap: () -> Void
    let onPay: (() -> Void)?

    init(
        invoice: Invoice,
        onTap: @escaping () -> Void,
        onPay: (() -> Void)? = nil
    ) {
        self.invoice = invoice
        self.onTap = onTap
        self.onPay = onPay
    }

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Invoice #\(invoice.invoiceNumber)")
                            .font(.titleSmall)
                            .foregroundColor(.textPrimary)

                        Text(invoice.formattedIssueDate)
                            .font(.captionMedium)
                            .foregroundColor(.textTertiary)
                    }

                    Spacer()

                    StatusBadge(
                        text: invoice.status.displayName,
                        color: statusColor(for: invoice.status)
                    )
                }

                Divider()

                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Amount Due")
                            .font(.captionMedium)
                            .foregroundColor(.textTertiary)

                        Text(invoice.formattedAmountDue)
                            .font(.titleMedium)
                            .foregroundColor(.textPrimary)
                    }

                    Spacer()

                    if let onPay = onPay, invoice.status == .pending || invoice.status == .partiallyPaid {
                        PrimaryButton("Pay Now", icon: "creditcard") {
                            onPay()
                        }
                        .frame(width: 120)
                    }
                }
            }
        }
        .buttonStyle(.scale)
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.backgroundSecondary)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(invoice.isOverdue ? Color.red.opacity(0.3) : Color.clear, lineWidth: 2)
                )
        )
    }

    private func statusColor(for status: InvoiceStatus) -> Color {
        switch status {
        case .draft: return .gray
        case .pending: return .yellow
        case .partiallyPaid: return .orange
        case .paid: return .green
        case .overdue: return .red
        case .cancelled: return .gray
        case .refunded: return .purple
        }
    }
}
