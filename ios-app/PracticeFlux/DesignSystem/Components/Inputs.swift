import SwiftUI

// MARK: - Text Field

struct PFTextField: View {
    let title: String
    let placeholder: String
    @Binding var text: String
    var icon: String?
    var keyboardType: UIKeyboardType = .default
    var textContentType: UITextContentType?
    var isSecure: Bool = false
    var errorMessage: String?

    @State private var isSecureTextVisible = false
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.labelMedium)
                .foregroundColor(.textSecondary)

            HStack(spacing: 12) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.bodyMedium)
                        .foregroundColor(isFocused ? .healthPrimary : .textTertiary)
                        .frame(width: 20)
                }

                if isSecure && !isSecureTextVisible {
                    SecureField(placeholder, text: $text)
                        .textContentType(textContentType)
                        .focused($isFocused)
                } else {
                    TextField(placeholder, text: $text)
                        .keyboardType(keyboardType)
                        .textContentType(textContentType)
                        .autocapitalization(keyboardType == .emailAddress ? .none : .sentences)
                        .focused($isFocused)
                }

                if isSecure {
                    Button {
                        isSecureTextVisible.toggle()
                    } label: {
                        Image(systemName: isSecureTextVisible ? "eye.slash" : "eye")
                            .font(.bodyMedium)
                            .foregroundColor(.textTertiary)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.backgroundSecondary)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(borderColor, lineWidth: isFocused ? 2 : 1)
                    )
            )

            if let error = errorMessage {
                Text(error)
                    .font(.captionMedium)
                    .foregroundColor(.error)
            }
        }
    }

    private var borderColor: Color {
        if errorMessage != nil {
            return .error
        }
        return isFocused ? .healthPrimary : .separator
    }
}

// MARK: - Text Area

struct PFTextArea: View {
    let title: String
    let placeholder: String
    @Binding var text: String
    var minHeight: CGFloat = 100
    var maxHeight: CGFloat = 200
    var errorMessage: String?

    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.labelMedium)
                .foregroundColor(.textSecondary)

            ZStack(alignment: .topLeading) {
                if text.isEmpty {
                    Text(placeholder)
                        .font(.bodyMedium)
                        .foregroundColor(.textPlaceholder)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                }

                TextEditor(text: $text)
                    .font(.bodyMedium)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .focused($isFocused)
            }
            .frame(minHeight: minHeight, maxHeight: maxHeight)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.backgroundSecondary)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(borderColor, lineWidth: isFocused ? 2 : 1)
                    )
            )

            if let error = errorMessage {
                Text(error)
                    .font(.captionMedium)
                    .foregroundColor(.error)
            }
        }
    }

    private var borderColor: Color {
        if errorMessage != nil {
            return .error
        }
        return isFocused ? .healthPrimary : .separator
    }
}

// MARK: - Search Bar

struct SearchBar: View {
    @Binding var text: String
    var placeholder: String = "Search..."
    var onSubmit: (() -> Void)?

    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.bodyMedium)
                .foregroundColor(.textTertiary)

            TextField(placeholder, text: $text)
                .font(.bodyMedium)
                .focused($isFocused)
                .onSubmit {
                    onSubmit?()
                }

            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.bodyMedium)
                        .foregroundColor(.textTertiary)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.backgroundSecondary)
        )
    }
}

// MARK: - Date Picker Field

struct DatePickerField: View {
    let title: String
    @Binding var date: Date
    var minimumDate: Date?
    var maximumDate: Date?
    var displayedComponents: DatePickerComponents = [.date]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.labelMedium)
                .foregroundColor(.textSecondary)

            DatePicker(
                "",
                selection: $date,
                in: dateRange,
                displayedComponents: displayedComponents
            )
            .datePickerStyle(.compact)
            .labelsHidden()
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.backgroundSecondary)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.separator, lineWidth: 1)
                    )
            )
        }
    }

    private var dateRange: ClosedRange<Date> {
        let min = minimumDate ?? Date.distantPast
        let max = maximumDate ?? Date.distantFuture
        return min...max
    }
}

// MARK: - Picker Field

struct PickerField<T: Hashable>: View {
    let title: String
    @Binding var selection: T
    let options: [T]
    let displayName: (T) -> String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.labelMedium)
                .foregroundColor(.textSecondary)

            Menu {
                ForEach(options, id: \.self) { option in
                    Button {
                        selection = option
                    } label: {
                        Text(displayName(option))
                    }
                }
            } label: {
                HStack {
                    Text(displayName(selection))
                        .font(.bodyMedium)
                        .foregroundColor(.textPrimary)

                    Spacer()

                    Image(systemName: "chevron.down")
                        .font(.captionLarge)
                        .foregroundColor(.textTertiary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.backgroundSecondary)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.separator, lineWidth: 1)
                        )
                )
            }
        }
    }
}
