# PracticeFlux Flutter App

A cross-platform mobile application for the PracticeFlux healthcare practice management system, built with Flutter.

## Features

- **Authentication**: Secure login with email/password and biometric (Face ID/Fingerprint) support
- **Appointments**: View, book, reschedule, and cancel appointments
- **Medical Records**: Access lab results, imaging, prescriptions, and visit notes
- **Secure Messaging**: HIPAA-compliant messaging with healthcare providers
- **Payments**: View invoices, payment history, and manage payment methods
- **Profile Management**: Update personal information and app preferences

## Requirements

- Flutter SDK 3.2.0+
- Dart 3.2.0+
- iOS 12.0+ / Android API 21+

## Architecture

The app follows a feature-first architecture with clean separation of concerns:

```
lib/
├── main.dart                 # App entry point
├── app.dart                  # App widget and providers
├── core/
│   ├── api/                  # API client and interceptors
│   ├── models/               # Data models
│   ├── router/               # Go Router configuration
│   ├── storage/              # Secure storage service
│   └── theme/                # App theme, colors, typography
└── features/
    ├── auth/                 # Authentication
    │   ├── providers/        # Auth state management
    │   └── screens/          # Login screens
    ├── home/                 # Home dashboard
    │   ├── screens/
    │   └── widgets/
    ├── appointments/         # Appointment management
    │   ├── screens/
    │   └── widgets/
    ├── records/              # Medical records
    ├── messages/             # Secure messaging
    ├── payments/             # Billing and payments
    ├── profile/              # User settings
    ├── main/                 # Main shell with navigation
    └── common/               # Shared widgets
```

## Key Technologies

- **Flutter 3.2**: Cross-platform UI framework
- **Riverpod**: State management
- **Go Router**: Declarative routing
- **Dio**: HTTP networking with interceptors
- **Flutter Secure Storage**: Encrypted local storage
- **Local Auth**: Biometric authentication

## Getting Started

1. Install dependencies:
   ```bash
   flutter pub get
   ```

2. Run code generation:
   ```bash
   flutter pub run build_runner build
   ```

3. Configure the API URL in `lib/core/api/api_client.dart`:
   ```dart
   const String baseUrl = 'https://api.practiceflux.com/v1';
   ```

4. Run the app:
   ```bash
   flutter run
   ```

## Building

### Android
```bash
flutter build apk --release
# or for app bundle
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Testing

```bash
flutter test
```

## Security Features

- Secure token storage with Flutter Secure Storage
- Biometric authentication support
- Automatic token refresh
- Session timeout
- HIPAA-compliant data handling

## State Management

The app uses Riverpod for state management:

- **StateNotifierProvider**: For complex state like authentication
- **FutureProvider**: For async data loading
- **Provider**: For service dependencies

## Dependencies

See `pubspec.yaml` for the complete list of dependencies.

## License

Proprietary - PracticeFlux Healthcare Solutions
