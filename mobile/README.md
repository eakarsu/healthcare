# PracticeFlux Mobile

A HIPAA-compliant React Native mobile application for the PracticeFlux healthcare practice management system. This app provides a patient portal experience for iOS and Android devices.

## Features

### Authentication
- Email/password login with secure token storage
- Two-factor authentication (2FA) support
- Biometric authentication (Face ID, Touch ID, Fingerprint)
- Password reset functionality
- New patient registration

### Patient Portal
- **Appointments**
  - View upcoming and past appointments
  - Book new appointments with step-by-step wizard
  - Appointment details with provider info
  - Cancel/reschedule appointments
  - Telehealth video visit support
  - Appointment reminders

- **Health Records**
  - Health summary dashboard
  - Active medications list
  - Allergies with severity indicators
  - Medical conditions (ICD-10)
  - Vitals history
  - Document access

- **Secure Messaging**
  - HIPAA-compliant messaging with care team
  - Message threads with read status
  - Compose new messages
  - Unread message indicators

- **Billing & Payments**
  - Current balance overview
  - Aging summary (30/60/90+ days)
  - Payment history
  - Invoice viewing
  - Payment methods management
  - Autopay setup

- **Profile**
  - Personal information
  - Insurance details
  - Emergency contacts
  - Notification preferences
  - Security settings (2FA, password)
  - Privacy controls

## Technology Stack

- **Framework**: React Native with Expo SDK 51
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: StyleSheet with custom theme system
- **Icons**: Expo Vector Icons (Ionicons)
- **Security**:
  - Expo Secure Store for token storage
  - Expo Local Authentication for biometrics
- **Forms**: React Hook Form + Zod validation

## Project Structure

```
mobile/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── verify-2fa.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── appointments/
│   │   ├── records/
│   │   ├── messages/
│   │   ├── payments/
│   │   └── profile/
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
├── src/
│   ├── api/                      # API service modules
│   │   ├── auth.ts
│   │   ├── appointments.ts
│   │   ├── records.ts
│   │   ├── messages.ts
│   │   └── payments.ts
│   ├── components/
│   │   └── ui/                   # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Avatar.tsx
│   │       ├── EmptyState.tsx
│   │       └── LoadingState.tsx
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities
│   │   └── api-client.ts         # Axios client with auth
│   ├── store/                    # Zustand stores
│   │   ├── auth-store.ts
│   │   └── appointments-store.ts
│   ├── theme/                    # Design system
│   │   └── index.ts              # Colors, typography, spacing
│   └── types/                    # TypeScript definitions
│       └── index.ts
├── assets/                       # App assets
├── app.json                      # Expo configuration
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (for testing)
npm run web
```

### Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Security Features

- **Secure Token Storage**: Uses Expo Secure Store (Keychain/Keystore)
- **Biometric Authentication**: Face ID, Touch ID, Fingerprint support
- **Automatic Session Timeout**: Configurable session expiration
- **Certificate Pinning**: Ready for production SSL pinning
- **No Plain-text Secrets**: All sensitive data encrypted at rest

## HIPAA Compliance

This app is designed with HIPAA compliance in mind:

- End-to-end encryption for all API communications (TLS 1.3)
- Secure local storage for authentication tokens
- Audit logging for all PHI access
- Session timeout after inactivity
- Biometric authentication option
- No PHI cached in plain text

## Building for Production

### iOS

```bash
# Build for iOS
eas build --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android
```

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Add proper type definitions
4. Test on both iOS and Android
5. Ensure HIPAA compliance for any PHI handling

## License

Proprietary - All rights reserved
