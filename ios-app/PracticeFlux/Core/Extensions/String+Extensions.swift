import Foundation

extension String {

    // MARK: - Validation

    var isValidEmail: Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let predicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return predicate.evaluate(with: self)
    }

    var isValidPhone: Bool {
        let phoneRegex = "^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$"
        let predicate = NSPredicate(format: "SELF MATCHES %@", phoneRegex)
        return predicate.evaluate(with: self) && self.count >= 10
    }

    var isValidPassword: Bool {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 digit
        let passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"
        let predicate = NSPredicate(format: "SELF MATCHES %@", passwordRegex)
        return predicate.evaluate(with: self)
    }

    var isBlank: Bool {
        trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    // MARK: - Formatting

    var trimmed: String {
        trimmingCharacters(in: .whitespacesAndNewlines)
    }

    var capitalizingFirstLetter: String {
        prefix(1).capitalized + dropFirst()
    }

    func truncated(to length: Int, addEllipsis: Bool = true) -> String {
        if count <= length {
            return self
        }
        let truncated = String(prefix(length))
        return addEllipsis ? truncated + "..." : truncated
    }

    // MARK: - Phone Formatting

    var formattedPhone: String {
        let cleaned = components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
        let mask = "(XXX) XXX-XXXX"
        var result = ""
        var index = cleaned.startIndex

        for ch in mask where index < cleaned.endIndex {
            if ch == "X" {
                result.append(cleaned[index])
                index = cleaned.index(after: index)
            } else {
                result.append(ch)
            }
        }

        return result
    }

    // MARK: - Masking

    func masked(with character: Character = "*", exposingLast count: Int = 4) -> String {
        guard self.count > count else { return self }
        let maskedPart = String(repeating: character, count: self.count - count)
        let exposedPart = String(suffix(count))
        return maskedPart + exposedPart
    }

    // MARK: - Initials

    var initials: String {
        let words = components(separatedBy: .whitespaces)
        let initials = words.compactMap { $0.first }.prefix(2)
        return String(initials).uppercased()
    }

    // MARK: - Date Parsing

    func toDate(format: String = "yyyy-MM-dd") -> Date? {
        let formatter = DateFormatter()
        formatter.dateFormat = format
        return formatter.date(from: self)
    }

    var iso8601Date: Date? {
        ISO8601DateFormatter().date(from: self)
    }
}

// MARK: - Optional String

extension Optional where Wrapped == String {
    var isNilOrEmpty: Bool {
        self?.isEmpty ?? true
    }

    var orEmpty: String {
        self ?? ""
    }
}
