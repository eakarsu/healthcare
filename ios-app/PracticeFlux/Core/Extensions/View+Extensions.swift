import SwiftUI

// MARK: - Conditional Modifier

extension View {
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }

    @ViewBuilder
    func ifLet<T, Content: View>(_ value: T?, transform: (Self, T) -> Content) -> some View {
        if let value = value {
            transform(self, value)
        } else {
            self
        }
    }
}

// MARK: - Hide Keyboard

extension View {
    func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }

    func onTapToDismissKeyboard() -> some View {
        self.onTapGesture {
            hideKeyboard()
        }
    }
}

// MARK: - Corner Radius

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

// MARK: - Navigation

extension View {
    func navigateTo<Destination: View>(
        isActive: Binding<Bool>,
        @ViewBuilder destination: () -> Destination
    ) -> some View {
        background(
            NavigationLink(
                destination: destination(),
                isActive: isActive,
                label: { EmptyView() }
            )
            .hidden()
        )
    }
}

// MARK: - Loading Overlay

extension View {
    func loadingOverlay(isLoading: Bool, message: String = "Loading...") -> some View {
        ZStack {
            self
                .disabled(isLoading)
                .blur(radius: isLoading ? 2 : 0)

            if isLoading {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()

                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.5)
                        .tint(.white)

                    Text(message)
                        .font(.bodyMedium)
                        .foregroundColor(.white)
                }
                .padding(24)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.black.opacity(0.7))
                )
            }
        }
    }
}

// MARK: - Error Alert

extension View {
    func errorAlert(error: Binding<Error?>, buttonTitle: String = "OK") -> some View {
        alert(
            "Error",
            isPresented: Binding(
                get: { error.wrappedValue != nil },
                set: { if !$0 { error.wrappedValue = nil } }
            ),
            presenting: error.wrappedValue
        ) { _ in
            Button(buttonTitle) {
                error.wrappedValue = nil
            }
        } message: { error in
            Text(error.localizedDescription)
        }
    }
}

// MARK: - Card Style

extension View {
    func cardStyle(padding: CGFloat = 16, cornerRadius: CGFloat = 16) -> some View {
        self
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Color.backgroundSecondary)
            )
    }

    func elevatedCardStyle(padding: CGFloat = 16, cornerRadius: CGFloat = 16) -> some View {
        self
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Color.backgroundSecondary)
                    .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
            )
    }
}

// MARK: - Shimmer Effect

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    gradient: Gradient(colors: [
                        .clear,
                        .white.opacity(0.5),
                        .clear
                    ]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .rotationEffect(.degrees(30))
                .offset(x: phase)
            )
            .mask(content)
            .onAppear {
                withAnimation(Animation.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 400
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}

// MARK: - Skeleton Loading

extension View {
    func skeleton(isLoading: Bool) -> some View {
        if isLoading {
            return AnyView(
                self
                    .redacted(reason: .placeholder)
                    .shimmer()
            )
        }
        return AnyView(self)
    }
}

// MARK: - Safe Area

extension View {
    func readSafeArea(onChange: @escaping (EdgeInsets) -> Void) -> some View {
        background(
            GeometryReader { geometry in
                Color.clear
                    .preference(key: SafeAreaInsetsKey.self, value: geometry.safeAreaInsets)
            }
        )
        .onPreferenceChange(SafeAreaInsetsKey.self, perform: onChange)
    }
}

private struct SafeAreaInsetsKey: PreferenceKey {
    static var defaultValue: EdgeInsets = .init()

    static func reduce(value: inout EdgeInsets, nextValue: () -> EdgeInsets) {
        value = nextValue()
    }
}
