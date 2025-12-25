# PracticeFlux iOS App

A native iOS application for the PracticeFlux healthcare practice management system, built with Swift and SwiftUI.

## Features

- **Authentication**: Secure login with email/password and Face ID/Touch ID support
- **Appointments**: View, book, reschedule, and cancel appointments
- **Medical Records**: Access lab results, imaging, prescriptions, and visit notes
- **Secure Messaging**: HIPAA-compliant messaging with healthcare providers
- **Payments**: View invoices, payment history, and manage payment methods
- **Profile Management**: Update personal information and app preferences

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## Architecture

The app follows a clean architecture pattern with clear separation of concerns:

```
PracticeFlux/
├── App/                    # App entry point and global state
├── Core/
│   ├── Models/            # Data models (User, Appointment, etc.)
│   ├── Networking/        # API client and endpoints
│   ├── Storage/           # Keychain and UserDefaults services
│   └── Extensions/        # Swift extensions
├── DesignSystem/
│   ├── Colors/            # Color palette
│   ├── Typography/        # Text styles
│   └── Components/        # Reusable UI components
├── Features/
│   ├── Auth/              # Authentication (Login, AuthManager)
│   ├── Home/              # Home dashboard
│   ├── Appointments/      # Appointment management
│   ├── Records/           # Medical records
│   ├── Messages/          # Secure messaging
│   ├── Payments/          # Billing and payments
│   ├── Profile/           # User profile and settings
│   └── Navigation/        # Tab navigation
└── Resources/             # Assets, Info.plist
```

## Key Technologies

- **SwiftUI**: Modern declarative UI framework
- **Swift Concurrency**: async/await for asynchronous operations
- **Keychain**: Secure storage for tokens and sensitive data
- **LocalAuthentication**: Face ID and Touch ID support
- **Combine**: Reactive programming for state management

## Security Features

- Secure token storage in iOS Keychain
- Biometric authentication (Face ID/Touch ID)
- Automatic session timeout
- HIPAA-compliant data handling
- Certificate pinning ready

## Getting Started

1. Open the project in Xcode:
   ```bash
   open PracticeFlux.xcodeproj
   ```

2. Configure the API base URL in `AppState.swift`:
   ```swift
   static let apiBaseURL = "https://api.practiceflux.com/v1"
   ```

3. Build and run on simulator or device

## Dependencies

Managed via Swift Package Manager:

- **Alamofire**: HTTP networking (optional, URLSession used by default)
- **KeychainSwift**: Keychain wrapper (optional, native implementation included)
- **Nuke**: Image loading and caching
- **Factory**: Dependency injection

## Testing

Run tests using Xcode's test navigator or:
```bash
xcodebuild test -scheme PracticeFlux -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Code Style

- Follow Swift API Design Guidelines
- Use SwiftLint for consistent code style
- Prefer composition over inheritance
- Write self-documenting code with clear naming

## License

Proprietary - PracticeFlux Healthcare Solutions
