import Foundation

// MARK: - Invoice Model

struct Invoice: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let invoiceNumber: String
    let status: InvoiceStatus
    let issueDate: Date
    let dueDate: Date
    let subtotal: Decimal
    let tax: Decimal
    let discount: Decimal
    let total: Decimal
    let amountPaid: Decimal
    let amountDue: Decimal
    let items: [InvoiceItem]?
    let payments: [Payment]?
    let notes: String?
    let createdAt: Date
    let updatedAt: Date

    var isOverdue: Bool {
        status == .pending && dueDate < Date()
    }

    var formattedTotal: String {
        formatCurrency(total)
    }

    var formattedAmountDue: String {
        formatCurrency(amountDue)
    }

    var formattedIssueDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: issueDate)
    }

    var formattedDueDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: dueDate)
    }

    private func formatCurrency(_ amount: Decimal) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: amount as NSDecimalNumber) ?? "$0.00"
    }

    enum CodingKeys: String, CodingKey {
        case id, status, subtotal, tax, discount, total, items, payments, notes
        case patientId = "patient_id"
        case invoiceNumber = "invoice_number"
        case issueDate = "issue_date"
        case dueDate = "due_date"
        case amountPaid = "amount_paid"
        case amountDue = "amount_due"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

enum InvoiceStatus: String, Codable, CaseIterable {
    case draft = "DRAFT"
    case pending = "PENDING"
    case partiallyPaid = "PARTIALLY_PAID"
    case paid = "PAID"
    case overdue = "OVERDUE"
    case cancelled = "CANCELLED"
    case refunded = "REFUNDED"

    var displayName: String {
        switch self {
        case .draft: return "Draft"
        case .pending: return "Pending"
        case .partiallyPaid: return "Partially Paid"
        case .paid: return "Paid"
        case .overdue: return "Overdue"
        case .cancelled: return "Cancelled"
        case .refunded: return "Refunded"
        }
    }

    var color: String {
        switch self {
        case .draft: return "gray"
        case .pending: return "yellow"
        case .partiallyPaid: return "orange"
        case .paid: return "green"
        case .overdue: return "red"
        case .cancelled: return "gray"
        case .refunded: return "purple"
        }
    }
}

// MARK: - Invoice Item

struct InvoiceItem: Codable, Identifiable, Equatable {
    let id: String
    let invoiceId: String
    let description: String
    let code: String?
    let quantity: Int
    let unitPrice: Decimal
    let total: Decimal

    var formattedUnitPrice: String {
        formatCurrency(unitPrice)
    }

    var formattedTotal: String {
        formatCurrency(total)
    }

    private func formatCurrency(_ amount: Decimal) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: amount as NSDecimalNumber) ?? "$0.00"
    }

    enum CodingKeys: String, CodingKey {
        case id, description, code, quantity, total
        case invoiceId = "invoice_id"
        case unitPrice = "unit_price"
    }
}

// MARK: - Payment Model

struct Payment: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let invoiceId: String?
    let amount: Decimal
    let paymentMethod: PaymentMethod
    let status: PaymentStatus
    let transactionId: String?
    let cardLast4: String?
    let cardBrand: String?
    let processedAt: Date?
    let refundedAt: Date?
    let refundAmount: Decimal?
    let notes: String?
    let createdAt: Date

    var formattedAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: amount as NSDecimalNumber) ?? "$0.00"
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: processedAt ?? createdAt)
    }

    var cardDisplay: String? {
        guard let last4 = cardLast4, let brand = cardBrand else { return nil }
        return "\(brand.capitalized) ****\(last4)"
    }

    enum CodingKeys: String, CodingKey {
        case id, amount, status, notes
        case patientId = "patient_id"
        case invoiceId = "invoice_id"
        case paymentMethod = "payment_method"
        case transactionId = "transaction_id"
        case cardLast4 = "card_last4"
        case cardBrand = "card_brand"
        case processedAt = "processed_at"
        case refundedAt = "refunded_at"
        case refundAmount = "refund_amount"
        case createdAt = "created_at"
    }
}

enum PaymentMethod: String, Codable, CaseIterable {
    case creditCard = "CREDIT_CARD"
    case debitCard = "DEBIT_CARD"
    case bankTransfer = "BANK_TRANSFER"
    case applePay = "APPLE_PAY"
    case insurance = "INSURANCE"
    case cash = "CASH"
    case check = "CHECK"

    var displayName: String {
        switch self {
        case .creditCard: return "Credit Card"
        case .debitCard: return "Debit Card"
        case .bankTransfer: return "Bank Transfer"
        case .applePay: return "Apple Pay"
        case .insurance: return "Insurance"
        case .cash: return "Cash"
        case .check: return "Check"
        }
    }

    var icon: String {
        switch self {
        case .creditCard, .debitCard: return "creditcard"
        case .bankTransfer: return "building.columns"
        case .applePay: return "apple.logo"
        case .insurance: return "shield"
        case .cash: return "banknote"
        case .check: return "doc.text"
        }
    }
}

enum PaymentStatus: String, Codable {
    case pending = "PENDING"
    case processing = "PROCESSING"
    case completed = "COMPLETED"
    case failed = "FAILED"
    case refunded = "REFUNDED"
    case partiallyRefunded = "PARTIALLY_REFUNDED"

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .processing: return "Processing"
        case .completed: return "Completed"
        case .failed: return "Failed"
        case .refunded: return "Refunded"
        case .partiallyRefunded: return "Partially Refunded"
        }
    }
}

// MARK: - Payment Requests

struct ProcessPaymentRequest: Codable {
    let invoiceId: String
    let amount: Decimal
    let paymentMethodId: String
    let savePaymentMethod: Bool

    enum CodingKeys: String, CodingKey {
        case amount
        case invoiceId = "invoice_id"
        case paymentMethodId = "payment_method_id"
        case savePaymentMethod = "save_payment_method"
    }
}

// MARK: - Saved Payment Method

struct SavedPaymentMethod: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let type: PaymentMethod
    let cardLast4: String?
    let cardBrand: String?
    let expiryMonth: Int?
    let expiryYear: Int?
    let isDefault: Bool
    let createdAt: Date

    var displayName: String {
        if let brand = cardBrand, let last4 = cardLast4 {
            return "\(brand.capitalized) ****\(last4)"
        }
        return type.displayName
    }

    var expiryDate: String? {
        guard let month = expiryMonth, let year = expiryYear else { return nil }
        return String(format: "%02d/%02d", month, year % 100)
    }

    enum CodingKeys: String, CodingKey {
        case id, type
        case patientId = "patient_id"
        case cardLast4 = "card_last4"
        case cardBrand = "card_brand"
        case expiryMonth = "expiry_month"
        case expiryYear = "expiry_year"
        case isDefault = "is_default"
        case createdAt = "created_at"
    }
}

// MARK: - Insurance

struct Insurance: Codable, Identifiable, Equatable {
    let id: String
    let patientId: String
    let provider: String
    let policyNumber: String
    let groupNumber: String?
    let subscriberId: String
    let subscriberName: String
    let relationship: String
    let effectiveDate: Date
    let terminationDate: Date?
    let isPrimary: Bool
    let createdAt: Date

    var isActive: Bool {
        if let terminationDate = terminationDate {
            return terminationDate > Date()
        }
        return true
    }

    enum CodingKeys: String, CodingKey {
        case id, provider, relationship
        case patientId = "patient_id"
        case policyNumber = "policy_number"
        case groupNumber = "group_number"
        case subscriberId = "subscriber_id"
        case subscriberName = "subscriber_name"
        case effectiveDate = "effective_date"
        case terminationDate = "termination_date"
        case isPrimary = "is_primary"
        case createdAt = "created_at"
    }
}
