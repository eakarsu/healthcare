import SwiftUI

// MARK: - Color Palette

extension Color {

    // MARK: - Brand Colors

    static let brandPrimary = Color("BrandPrimary", bundle: nil)
    static let brandSecondary = Color("BrandSecondary", bundle: nil)
    static let brandAccent = Color("BrandAccent", bundle: nil)

    // MARK: - Semantic Colors

    static let success = Color.green
    static let warning = Color.orange
    static let error = Color.red
    static let info = Color.blue

    // MARK: - Healthcare Specific

    static let healthPrimary = Color(hex: "0EA5E9") // Sky blue
    static let healthSecondary = Color(hex: "06B6D4") // Cyan
    static let healthAccent = Color(hex: "8B5CF6") // Purple

    // MARK: - Neutral Colors

    static let neutral50 = Color(hex: "FAFAFA")
    static let neutral100 = Color(hex: "F5F5F5")
    static let neutral200 = Color(hex: "E5E5E5")
    static let neutral300 = Color(hex: "D4D4D4")
    static let neutral400 = Color(hex: "A3A3A3")
    static let neutral500 = Color(hex: "737373")
    static let neutral600 = Color(hex: "525252")
    static let neutral700 = Color(hex: "404040")
    static let neutral800 = Color(hex: "262626")
    static let neutral900 = Color(hex: "171717")

    // MARK: - Background Colors

    static let backgroundPrimary = Color(.systemBackground)
    static let backgroundSecondary = Color(.secondarySystemBackground)
    static let backgroundTertiary = Color(.tertiarySystemBackground)
    static let backgroundGrouped = Color(.systemGroupedBackground)

    // MARK: - Text Colors

    static let textPrimary = Color(.label)
    static let textSecondary = Color(.secondaryLabel)
    static let textTertiary = Color(.tertiaryLabel)
    static let textPlaceholder = Color(.placeholderText)

    // MARK: - Separator Colors

    static let separator = Color(.separator)
    static let opaqueSeparator = Color(.opaqueSeparator)

    // MARK: - Status Colors

    static let statusScheduled = Color.blue
    static let statusConfirmed = Color.green
    static let statusCheckedIn = Color.purple
    static let statusInProgress = Color.orange
    static let statusCompleted = Color.gray
    static let statusCancelled = Color.red
}

// MARK: - Hex Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)

        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    var hexString: String {
        guard let components = UIColor(self).cgColor.components, components.count >= 3 else {
            return "000000"
        }

        let r = Float(components[0])
        let g = Float(components[1])
        let b = Float(components[2])

        return String(format: "%02lX%02lX%02lX",
                      lroundf(r * 255),
                      lroundf(g * 255),
                      lroundf(b * 255))
    }
}

// MARK: - Gradient Definitions

extension LinearGradient {

    static let primaryGradient = LinearGradient(
        colors: [.healthPrimary, .healthSecondary],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let accentGradient = LinearGradient(
        colors: [.healthAccent, .healthPrimary],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let successGradient = LinearGradient(
        colors: [Color.green.opacity(0.8), Color.green],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let cardGradient = LinearGradient(
        colors: [.backgroundSecondary, .backgroundTertiary],
        startPoint: .top,
        endPoint: .bottom
    )
}
