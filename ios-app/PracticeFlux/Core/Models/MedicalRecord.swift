import Foundation

// MARK: - Medical Record Model

struct MedicalRecord: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let providerId: String?
    let recordType: RecordType
    let title: String
    let description: String?
    let date: Date
    let attachments: [Attachment]?
    let metadata: [String: String]?
    let isConfidential: Bool
    let provider: Provider?
    let createdAt: Date
    let updatedAt: Date

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        return formatter.string(from: date)
    }

    enum CodingKeys: String, CodingKey {
        case id, title, description, date, attachments, metadata, provider
        case patientId = "patient_id"
        case providerId = "provider_id"
        case recordType = "record_type"
        case isConfidential = "is_confidential"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

enum RecordType: String, Codable, CaseIterable {
    case labResult = "LAB_RESULT"
    case imaging = "IMAGING"
    case prescription = "PRESCRIPTION"
    case visitNote = "VISIT_NOTE"
    case diagnosis = "DIAGNOSIS"
    case immunization = "IMMUNIZATION"
    case procedure = "PROCEDURE"
    case referral = "REFERRAL"
    case allergy = "ALLERGY"
    case vital = "VITAL"
    case document = "DOCUMENT"

    var displayName: String {
        switch self {
        case .labResult: return "Lab Result"
        case .imaging: return "Imaging"
        case .prescription: return "Prescription"
        case .visitNote: return "Visit Note"
        case .diagnosis: return "Diagnosis"
        case .immunization: return "Immunization"
        case .procedure: return "Procedure"
        case .referral: return "Referral"
        case .allergy: return "Allergy"
        case .vital: return "Vital Signs"
        case .document: return "Document"
        }
    }

    var icon: String {
        switch self {
        case .labResult: return "testtube.2"
        case .imaging: return "photo"
        case .prescription: return "pills"
        case .visitNote: return "doc.text"
        case .diagnosis: return "stethoscope"
        case .immunization: return "syringe"
        case .procedure: return "cross.case"
        case .referral: return "arrow.right.doc.on.clipboard"
        case .allergy: return "exclamationmark.triangle"
        case .vital: return "heart.text.square"
        case .document: return "doc"
        }
    }
}

// MARK: - Attachment Model

struct Attachment: Codable, Identifiable, Equatable {
    let id: String
    let fileName: String
    let fileType: String
    let fileSize: Int
    let url: String
    let uploadedAt: Date

    var formattedFileSize: String {
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(fileSize))
    }

    var isImage: Bool {
        ["jpg", "jpeg", "png", "gif", "heic"].contains(fileType.lowercased())
    }

    var isPDF: Bool {
        fileType.lowercased() == "pdf"
    }

    enum CodingKeys: String, CodingKey {
        case id, url
        case fileName = "file_name"
        case fileType = "file_type"
        case fileSize = "file_size"
        case uploadedAt = "uploaded_at"
    }
}

// MARK: - Vital Signs

struct VitalSigns: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let recordedAt: Date
    let bloodPressureSystolic: Int?
    let bloodPressureDiastolic: Int?
    let heartRate: Int?
    let temperature: Double?
    let respiratoryRate: Int?
    let oxygenSaturation: Int?
    let weight: Double?
    let height: Double?
    let notes: String?

    var bloodPressure: String? {
        guard let systolic = bloodPressureSystolic,
              let diastolic = bloodPressureDiastolic else { return nil }
        return "\(systolic)/\(diastolic) mmHg"
    }

    var bmi: Double? {
        guard let weight = weight, let height = height, height > 0 else { return nil }
        let heightInMeters = height / 100
        return weight / (heightInMeters * heightInMeters)
    }

    var formattedBMI: String? {
        guard let bmi = bmi else { return nil }
        return String(format: "%.1f", bmi)
    }

    enum CodingKeys: String, CodingKey {
        case id, weight, height, notes
        case patientId = "patient_id"
        case recordedAt = "recorded_at"
        case bloodPressureSystolic = "blood_pressure_systolic"
        case bloodPressureDiastolic = "blood_pressure_diastolic"
        case heartRate = "heart_rate"
        case temperature
        case respiratoryRate = "respiratory_rate"
        case oxygenSaturation = "oxygen_saturation"
    }
}

// MARK: - Medication

struct Medication: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let prescriberId: String?
    let name: String
    let dosage: String
    let frequency: String
    let route: String?
    let startDate: Date
    let endDate: Date?
    let instructions: String?
    let refillsRemaining: Int?
    let isActive: Bool
    let prescriber: Provider?

    var isCurrentlyActive: Bool {
        guard isActive else { return false }
        if let endDate = endDate {
            return endDate > Date()
        }
        return true
    }

    enum CodingKeys: String, CodingKey {
        case id, name, dosage, frequency, route, instructions, prescriber
        case patientId = "patient_id"
        case prescriberId = "prescriber_id"
        case startDate = "start_date"
        case endDate = "end_date"
        case refillsRemaining = "refills_remaining"
        case isActive = "is_active"
    }
}

// MARK: - Allergy

struct Allergy: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let allergen: String
    let reaction: String?
    let severity: AllergySeverity
    let onsetDate: Date?
    let notes: String?
    let isActive: Bool

    enum CodingKeys: String, CodingKey {
        case id, allergen, reaction, severity, notes
        case patientId = "patient_id"
        case onsetDate = "onset_date"
        case isActive = "is_active"
    }
}

enum AllergySeverity: String, Codable, CaseIterable {
    case mild = "MILD"
    case moderate = "MODERATE"
    case severe = "SEVERE"
    case lifeThreatening = "LIFE_THREATENING"

    var displayName: String {
        switch self {
        case .mild: return "Mild"
        case .moderate: return "Moderate"
        case .severe: return "Severe"
        case .lifeThreatening: return "Life-threatening"
        }
    }

    var color: String {
        switch self {
        case .mild: return "green"
        case .moderate: return "yellow"
        case .severe: return "orange"
        case .lifeThreatening: return "red"
        }
    }
}
