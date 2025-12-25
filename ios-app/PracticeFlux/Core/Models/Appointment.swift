import Foundation

// MARK: - Appointment Model

struct Appointment: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let providerId: String
    let locationId: String?
    let appointmentType: AppointmentType
    let status: AppointmentStatus
    let startTime: Date
    let endTime: Date
    let notes: String?
    let reason: String?
    let isVirtual: Bool
    let virtualMeetingUrl: String?
    let provider: Provider?
    let location: Location?
    let createdAt: Date
    let updatedAt: Date

    var duration: TimeInterval {
        endTime.timeIntervalSince(startTime)
    }

    var durationMinutes: Int {
        Int(duration / 60)
    }

    var isUpcoming: Bool {
        startTime > Date()
    }

    var isPast: Bool {
        endTime < Date()
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: startTime)
    }

    var formattedTime: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return "\(formatter.string(from: startTime)) - \(formatter.string(from: endTime))"
    }

    enum CodingKeys: String, CodingKey {
        case id, status, notes, reason, provider, location
        case patientId = "patient_id"
        case providerId = "provider_id"
        case locationId = "location_id"
        case appointmentType = "appointment_type"
        case startTime = "start_time"
        case endTime = "end_time"
        case isVirtual = "is_virtual"
        case virtualMeetingUrl = "virtual_meeting_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

enum AppointmentType: String, Codable, CaseIterable {
    case checkup = "CHECKUP"
    case followUp = "FOLLOW_UP"
    case consultation = "CONSULTATION"
    case procedure = "PROCEDURE"
    case labWork = "LAB_WORK"
    case imaging = "IMAGING"
    case vaccination = "VACCINATION"
    case emergency = "EMERGENCY"
    case telehealth = "TELEHEALTH"

    var displayName: String {
        switch self {
        case .checkup: return "Check-up"
        case .followUp: return "Follow-up"
        case .consultation: return "Consultation"
        case .procedure: return "Procedure"
        case .labWork: return "Lab Work"
        case .imaging: return "Imaging"
        case .vaccination: return "Vaccination"
        case .emergency: return "Emergency"
        case .telehealth: return "Telehealth"
        }
    }

    var icon: String {
        switch self {
        case .checkup: return "stethoscope"
        case .followUp: return "arrow.counterclockwise"
        case .consultation: return "person.2"
        case .procedure: return "cross.case"
        case .labWork: return "testtube.2"
        case .imaging: return "camera.metering.unknown"
        case .vaccination: return "syringe"
        case .emergency: return "cross.circle"
        case .telehealth: return "video"
        }
    }
}

enum AppointmentStatus: String, Codable, CaseIterable {
    case scheduled = "SCHEDULED"
    case confirmed = "CONFIRMED"
    case checkedIn = "CHECKED_IN"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"
    case noShow = "NO_SHOW"
    case rescheduled = "RESCHEDULED"

    var displayName: String {
        switch self {
        case .scheduled: return "Scheduled"
        case .confirmed: return "Confirmed"
        case .checkedIn: return "Checked In"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        case .noShow: return "No Show"
        case .rescheduled: return "Rescheduled"
        }
    }

    var color: String {
        switch self {
        case .scheduled: return "blue"
        case .confirmed: return "green"
        case .checkedIn: return "purple"
        case .inProgress: return "orange"
        case .completed: return "gray"
        case .cancelled: return "red"
        case .noShow: return "red"
        case .rescheduled: return "yellow"
        }
    }
}

// MARK: - Provider Model

struct Provider: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let specialty: String
    let licenseNumber: String?
    let npi: String?
    let user: User?

    var displayName: String {
        if let user = user {
            return "Dr. \(user.fullName)"
        }
        return "Provider"
    }

    enum CodingKeys: String, CodingKey {
        case id, specialty, user
        case userId = "user_id"
        case licenseNumber = "license_number"
        case npi
    }
}

// MARK: - Location Model

struct Location: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let address: String
    let city: String
    let state: String
    let zipCode: String
    let phone: String?
    let isActive: Bool

    var fullAddress: String {
        "\(address), \(city), \(state) \(zipCode)"
    }

    enum CodingKeys: String, CodingKey {
        case id, name, address, city, state, phone
        case zipCode = "zip_code"
        case isActive = "is_active"
    }
}

// MARK: - Appointment Requests

struct CreateAppointmentRequest: Codable {
    let providerId: String
    let locationId: String?
    let appointmentType: AppointmentType
    let startTime: Date
    let endTime: Date
    let reason: String?
    let isVirtual: Bool

    enum CodingKeys: String, CodingKey {
        case reason
        case providerId = "provider_id"
        case locationId = "location_id"
        case appointmentType = "appointment_type"
        case startTime = "start_time"
        case endTime = "end_time"
        case isVirtual = "is_virtual"
    }
}

struct RescheduleAppointmentRequest: Codable {
    let startTime: Date
    let endTime: Date
    let reason: String?

    enum CodingKeys: String, CodingKey {
        case reason
        case startTime = "start_time"
        case endTime = "end_time"
    }
}
