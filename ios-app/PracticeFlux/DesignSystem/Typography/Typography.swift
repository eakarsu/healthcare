import SwiftUI

// MARK: - Typography

extension Font {

    // MARK: - Display

    static let displayLarge = Font.system(size: 57, weight: .regular)
    static let displayMedium = Font.system(size: 45, weight: .regular)
    static let displaySmall = Font.system(size: 36, weight: .regular)

    // MARK: - Headline

    static let headlineLarge = Font.system(size: 32, weight: .semibold)
    static let headlineMedium = Font.system(size: 28, weight: .semibold)
    static let headlineSmall = Font.system(size: 24, weight: .semibold)

    // MARK: - Title

    static let titleLarge = Font.system(size: 22, weight: .medium)
    static let titleMedium = Font.system(size: 18, weight: .medium)
    static let titleSmall = Font.system(size: 14, weight: .medium)

    // MARK: - Body

    static let bodyLarge = Font.system(size: 16, weight: .regular)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
    static let bodySmall = Font.system(size: 12, weight: .regular)

    // MARK: - Label

    static let labelLarge = Font.system(size: 14, weight: .medium)
    static let labelMedium = Font.system(size: 12, weight: .medium)
    static let labelSmall = Font.system(size: 11, weight: .medium)

    // MARK: - Caption

    static let captionLarge = Font.system(size: 12, weight: .regular)
    static let captionMedium = Font.system(size: 11, weight: .regular)
    static let captionSmall = Font.system(size: 10, weight: .regular)
}

// MARK: - Text Style Modifier

struct TextStyleModifier: ViewModifier {
    let style: TextStyle

    func body(content: Content) -> some View {
        content
            .font(style.font)
            .foregroundColor(style.color)
            .lineSpacing(style.lineSpacing)
    }
}

enum TextStyle {
    case displayLarge
    case displayMedium
    case displaySmall
    case headlineLarge
    case headlineMedium
    case headlineSmall
    case titleLarge
    case titleMedium
    case titleSmall
    case bodyLarge
    case bodyMedium
    case bodySmall
    case labelLarge
    case labelMedium
    case labelSmall
    case captionLarge
    case captionMedium
    case captionSmall

    var font: Font {
        switch self {
        case .displayLarge: return .displayLarge
        case .displayMedium: return .displayMedium
        case .displaySmall: return .displaySmall
        case .headlineLarge: return .headlineLarge
        case .headlineMedium: return .headlineMedium
        case .headlineSmall: return .headlineSmall
        case .titleLarge: return .titleLarge
        case .titleMedium: return .titleMedium
        case .titleSmall: return .titleSmall
        case .bodyLarge: return .bodyLarge
        case .bodyMedium: return .bodyMedium
        case .bodySmall: return .bodySmall
        case .labelLarge: return .labelLarge
        case .labelMedium: return .labelMedium
        case .labelSmall: return .labelSmall
        case .captionLarge: return .captionLarge
        case .captionMedium: return .captionMedium
        case .captionSmall: return .captionSmall
        }
    }

    var color: Color {
        switch self {
        case .displayLarge, .displayMedium, .displaySmall,
             .headlineLarge, .headlineMedium, .headlineSmall,
             .titleLarge, .titleMedium:
            return .textPrimary
        case .titleSmall, .bodyLarge, .bodyMedium:
            return .textPrimary
        case .bodySmall, .labelLarge, .labelMedium, .labelSmall:
            return .textSecondary
        case .captionLarge, .captionMedium, .captionSmall:
            return .textTertiary
        }
    }

    var lineSpacing: CGFloat {
        switch self {
        case .displayLarge, .displayMedium, .displaySmall:
            return 4
        case .headlineLarge, .headlineMedium, .headlineSmall:
            return 3
        case .titleLarge, .titleMedium, .titleSmall:
            return 2
        case .bodyLarge, .bodyMedium, .bodySmall:
            return 4
        case .labelLarge, .labelMedium, .labelSmall:
            return 2
        case .captionLarge, .captionMedium, .captionSmall:
            return 1
        }
    }
}

extension View {
    func textStyle(_ style: TextStyle) -> some View {
        modifier(TextStyleModifier(style: style))
    }
}
