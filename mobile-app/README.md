# PracticeFlux Mobile App

A comprehensive, production-ready React Native mobile application for the PracticeFlux healthcare practice management system. Built with Expo, TypeScript, and modern React patterns.

## Features

### Core Functionality
- **Authentication**: Secure login with email/password, biometric authentication (Face ID, Touch ID), and 2FA support
- **Patient Portal**: Full access to health information, appointments, messaging, and billing
- **Offline Support**: Queue requests when offline, sync when connection restored
- **Push Notifications**: Real-time alerts for appointments, messages, and health updates

### Screens

| Screen | Description |
|--------|-------------|
| **Home** | Dashboard with quick actions, upcoming appointments, health summary |
| **Appointments** | View, book, cancel, reschedule appointments with providers |
| **Health Records** | Medications, allergies, conditions, vitals, lab results |
| **Messages** | HIPAA-compliant secure messaging with care team |
| **Payments** | View balance, pay bills, manage payment methods |
| **Profile** | Personal info, settings, security, notifications |

## Technology Stack

### Core
- **React Native** 0.74+ with **Expo SDK 51**
- **TypeScript** for type safety
- **Expo Router** for file-based navigation with deep linking

### State & Data
- **Zustand** for global state management
- **TanStack Query** for server state and caching
- **Axios** for API communication
- **MMKV** / **AsyncStorage** for local persistence
- **Expo Secure Store** for sensitive data (tokens, credentials)

### UI & UX
- **React Native Reanimated** for smooth animations
- **React Native Gesture Handler** for native gestures
- **Expo Image** for optimized image loading
- **Bottom Sheet** for modal interactions
- **Flash List** for performant lists
- **Lottie** for animations

### Security & Auth
- **Expo Local Authentication** for biometrics
- **Secure token storage** using device keychain/keystore
- **Automatic token refresh** with retry logic
- **Session management** with timeout

### Notifications
- **Expo Notifications** for push notifications
- **Background handlers** for silent notifications

## Project Structure

```
mobile-app/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth screens (login, register, etc.)
│   ├── (tabs)/                   # Main tab screens
│   │   ├── home/
│   │   ├── appointments/
│   │   ├── records/
│   │   ├── messages/
│   │   ├── payments/
│   │   └── profile/
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry redirect
├── src/
│   ├── api/                      # API client and endpoints
│   │   └── client.ts             # Axios client with offline support
│   ├── components/
│   │   ├── ui/                   # Core UI components
│   │   │   ├── Text.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Badge.tsx
│   │   ├── forms/                # Form components
│   │   ├── layout/               # Layout components
│   │   └── features/             # Feature-specific components
│   ├── config/                   # App configuration
│   ├── constants/                # App constants
│   ├── hooks/                    # Custom React hooks
│   │   └── useTheme.ts
│   ├── lib/                      # Utility libraries
│   ├── services/                 # Business logic services
│   │   └── storage.ts            # Storage abstraction
│   ├── store/                    # Zustand stores
│   │   └── auth.ts               # Authentication store
│   ├── theme/                    # Design system
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── shadows.ts
│   │   ├── borderRadius.ts
│   │   └── index.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   └── utils/                    # Utility functions
├── assets/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── animations/
├── __tests__/                    # Test files
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Studio

### Installation

```bash
# Clone and navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# Start development server
npm start
```

### Running

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (for testing)
npm run web
```

### Environment Setup

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_ENV=development
```

## Development

### Code Style

- Use TypeScript strict mode
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error boundaries

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Building for Production

### Using EAS Build

```bash
# Configure EAS
eas build:configure

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Build both
npm run build:all
```

### Submitting to App Stores

```bash
# Submit to App Store
npm run submit:ios

# Submit to Play Store
npm run submit:android
```

## Security Considerations

### HIPAA Compliance
- All API communication over HTTPS/TLS 1.3
- Sensitive data stored in device secure enclave
- Session timeout after inactivity
- Biometric authentication option
- Comprehensive audit logging

### Data Protection
- No PHI stored in plain text
- Automatic token refresh
- Secure credential storage
- Certificate pinning (production)

## Architecture Decisions

### Why Expo?
- Faster development cycle
- Managed workflow for common native features
- Over-the-air updates
- Easy CI/CD integration

### Why Zustand?
- Minimal boilerplate
- TypeScript first
- Easy to test
- Works great with React Query

### Why Expo Router?
- File-based routing (Next.js-like)
- Built-in deep linking
- Type-safe navigation
- Easy nested layouts

## Contributing

1. Follow the code style guidelines
2. Write tests for new features
3. Update documentation
4. Test on both iOS and Android

## License

Proprietary - All rights reserved
