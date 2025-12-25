import Foundation

// MARK: - Message Model

struct Message: Codable, Identifiable, Equatable {
    let id: String
    let conversationId: String
    let senderId: String
    let recipientId: String
    let subject: String?
    let body: String
    let isRead: Bool
    let readAt: Date?
    let attachments: [Attachment]?
    let sender: User?
    let recipient: User?
    let createdAt: Date
    let updatedAt: Date

    var formattedDate: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }

    var preview: String {
        let maxLength = 100
        if body.count <= maxLength {
            return body
        }
        return String(body.prefix(maxLength)) + "..."
    }

    enum CodingKeys: String, CodingKey {
        case id, subject, body, attachments, sender, recipient
        case conversationId = "conversation_id"
        case senderId = "sender_id"
        case recipientId = "recipient_id"
        case isRead = "is_read"
        case readAt = "read_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Conversation Model

struct Conversation: Codable, Identifiable, Equatable {
    let id: String
    let participants: [User]
    let lastMessage: Message?
    let unreadCount: Int
    let subject: String?
    let isArchived: Bool
    let createdAt: Date
    let updatedAt: Date

    var otherParticipants: [User] {
        // Would filter out current user in real implementation
        participants
    }

    var displayName: String {
        if let subject = subject, !subject.isEmpty {
            return subject
        }
        return otherParticipants.map { $0.fullName }.joined(separator: ", ")
    }

    enum CodingKeys: String, CodingKey {
        case id, participants, subject
        case lastMessage = "last_message"
        case unreadCount = "unread_count"
        case isArchived = "is_archived"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Message Requests

struct SendMessageRequest: Codable {
    let recipientId: String
    let subject: String?
    let body: String
    let conversationId: String?

    enum CodingKeys: String, CodingKey {
        case subject, body
        case recipientId = "recipient_id"
        case conversationId = "conversation_id"
    }
}

struct MarkAsReadRequest: Codable {
    let messageIds: [String]

    enum CodingKeys: String, CodingKey {
        case messageIds = "message_ids"
    }
}

// MARK: - Notification Model

struct AppNotification: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let type: NotificationType
    let title: String
    let body: String
    let data: [String: String]?
    let isRead: Bool
    let readAt: Date?
    let createdAt: Date

    var formattedDate: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }

    enum CodingKeys: String, CodingKey {
        case id, type, title, body, data
        case userId = "user_id"
        case isRead = "is_read"
        case readAt = "read_at"
        case createdAt = "created_at"
    }
}

enum NotificationType: String, Codable {
    case appointmentReminder = "APPOINTMENT_REMINDER"
    case appointmentConfirmation = "APPOINTMENT_CONFIRMATION"
    case appointmentCancellation = "APPOINTMENT_CANCELLATION"
    case newMessage = "NEW_MESSAGE"
    case labResults = "LAB_RESULTS"
    case prescriptionReady = "PRESCRIPTION_READY"
    case paymentDue = "PAYMENT_DUE"
    case paymentReceived = "PAYMENT_RECEIVED"
    case documentAvailable = "DOCUMENT_AVAILABLE"
    case general = "GENERAL"

    var icon: String {
        switch self {
        case .appointmentReminder, .appointmentConfirmation: return "calendar"
        case .appointmentCancellation: return "calendar.badge.minus"
        case .newMessage: return "envelope"
        case .labResults: return "testtube.2"
        case .prescriptionReady: return "pills"
        case .paymentDue: return "dollarsign.circle"
        case .paymentReceived: return "checkmark.circle"
        case .documentAvailable: return "doc"
        case .general: return "bell"
        }
    }
}
