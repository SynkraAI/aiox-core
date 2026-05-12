# CLAUDE.md — Mobile Project (React Native)

## Project Overview

- **Name:** [APP_NAME]
- **Description:** [What the app does]
- **Type:** Mobile application
- **Framework:** React Native / Expo
- **Platforms:** iOS + Android
- **Status:** [Development / Beta / Production]

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.76.x |
| Tooling | Expo SDK | 52.x |
| Language | TypeScript | 5.x |
| Navigation | React Navigation | 7.x |
| State (client) | Zustand | 5.x |
| Data Fetching | TanStack Query | 5.x |
| Styling | NativeWind / StyleSheet | — |
| Forms | React Hook Form + Zod | — |
| Auth | Supabase Auth | — |
| Testing | Jest + React Native Testing Library | — |
| E2E Testing | Detox / Maestro | — |

## Directory Structure

```
src/
  app/                    # Expo Router screens (file-based routing)
    (tabs)/               # Tab navigator group
    (auth)/               # Auth flow screens
    _layout.tsx           # Root layout
  components/
    ui/                   # Base UI components (Button, Input, Card)
    shared/               # Shared composite components
    features/             # Feature-specific components
  hooks/                  # Custom hooks
  stores/                 # Zustand stores
  services/               # API services and external integrations
  lib/                    # Utility libraries
  types/                  # TypeScript type definitions
  constants/              # App constants (colors, spacing, config)
  assets/                 # Images, fonts, animations
    images/
    fonts/
    animations/           # Lottie files
ios/                      # iOS native project
android/                  # Android native project
```

## Platform-Specific Considerations

### iOS
- Minimum deployment target: iOS 15.0
- Test on both iPhone and iPad if universal
- Handle safe area insets with `SafeAreaView` or `useSafeAreaInsets()`
- Request permissions gracefully (camera, location, notifications)
- Handle keyboard avoidance for forms

### Android
- Minimum SDK: 24 (Android 7.0)
- Handle back button behavior with navigation
- Test on various screen densities (mdpi, hdpi, xhdpi, xxhdpi)
- Handle Android-specific permissions in `AndroidManifest.xml`
- Test gesture navigation vs button navigation

### Platform-Specific Files
```
Component.tsx             # Shared (default)
Component.ios.tsx         # iOS-only override
Component.android.tsx     # Android-only override
```

Use `Platform.select()` for minor differences:
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 4 },
  }),
});
```

## Navigation Patterns

### Stack Navigation
```typescript
// Use typed navigation
type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};
```

### Tab Navigation
- Maximum 5 tabs
- Use icons + labels for accessibility
- Badge for notification counts

### Deep Linking
- Configure URL scheme: `myapp://`
- Handle universal links (iOS) and App Links (Android)
- Test with `npx uri-scheme open myapp://profile/123`

## State Management

### Local State
- `useState` for component-scoped state
- `useReducer` for complex component logic

### Global State (Zustand)
- Persist with `zustand/middleware` + AsyncStorage
- Wait for hydration before rendering protected screens
- Separate stores by domain (auth, preferences, cart)

### Server State (TanStack Query)
- Configure offline support with `onlineManager`
- Use optimistic updates for responsive UX
- Set `staleTime` appropriately (longer for mobile to reduce data usage)

## Common Commands

```bash
# Development
npx expo start             # Start Expo dev server
npx expo start --ios       # Open in iOS Simulator
npx expo start --android   # Open in Android Emulator
npx expo start --web       # Open in web browser

# Building
eas build --platform ios                 # iOS build
eas build --platform android             # Android build
eas build --platform all                 # Both platforms

# Testing
npm test                   # Run Jest tests
npm run test:e2e:ios       # E2E tests on iOS
npm run test:e2e:android   # E2E tests on Android

# Code Quality
npm run lint               # ESLint check
npm run typecheck          # TypeScript check
npm run format             # Prettier formatting

# Native
npx pod-install            # Install iOS CocoaPods
npx react-native link      # Link native modules (legacy)
```

## Build and Deploy

### EAS Build
```bash
eas build:configure                      # Initial setup
eas build --profile development          # Development build
eas build --profile preview              # Internal testing
eas build --profile production           # Store submission
```

### Over-the-Air Updates
```bash
eas update --branch production           # Push OTA update
eas update --branch preview              # Preview update
```

## Testing Strategy

| Level | Tool | Target |
|-------|------|--------|
| Unit | Jest | Hooks, utilities, stores |
| Component | RNTL | UI components (render, interaction) |
| Integration | Jest + RNTL | Screen-level flows |
| E2E | Detox/Maestro | Full user journeys |
| Visual | Storybook RN | Component catalog |

### Testing Tips
- Use `@testing-library/react-native` over Enzyme
- Mock `react-native` modules: `Animated`, `Platform`, etc.
- Test both platforms when using `Platform.select()`
- Use `jest.useFakeTimers()` for animation tests
- Mock `AsyncStorage` for store tests

## Important Notes

- Always test on real devices before release (simulators miss performance issues)
- Keep bundle size small: lazy-load screens, optimize images
- Handle offline state gracefully — queue actions for sync
- Follow Apple HIG and Material Design guidelines
- Never hardcode dimensions — use responsive layouts with Dimensions/useWindowDimensions
- Test accessibility with screen readers (VoiceOver on iOS, TalkBack on Android)
- Use `react-native-reanimated` for 60fps animations (avoid Animated API for complex cases)
- Handle app state changes (background, foreground) for data refresh
