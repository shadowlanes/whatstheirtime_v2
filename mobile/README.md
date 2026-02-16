# What's Their Time - Mobile App

React Native mobile app for tracking friends' times across timezones.

## Setup

```bash
npm install
npm start
```

## Run on Devices

```bash
npm run ios     # iOS simulator
npm run android # Android emulator
```

## Building

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android
```

## App Icon & Splash Screen

### Required Assets

1. **App Icon** (1024x1024 PNG, no transparency):
   - Place at: `assets/icon.png`
   - Theme: Purple gradient with clock/globe motif
   - Should be visually distinctive and recognizable at small sizes

2. **Adaptive Icon** (1024x1024 PNG for Android):
   - Place at: `assets/adaptive-icon.png`
   - Safe zone: 66% of canvas (center 672x672px)
   - Background: Solid purple (#9333ea) or gradient

3. **Splash Screen** (1242x2436 PNG):
   - Place at: `assets/splash-icon.png`
   - Background: White or light purple gradient
   - Center: App icon/logo
   - Should load quickly and match app theme

### Design Guidelines

- **Primary Color**: Purple (#9333ea)
- **Theme**: Time zones, clocks, global connectivity
- **Style**: Modern, clean, friendly
- **Iconography**: Clock, globe, timezone symbols

## Environment Variables

### Development (.env.development)
```
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_ENV=development
```

### Production (.env.production)
```
EXPO_PUBLIC_API_URL=https://your-production-api.com
EXPO_PUBLIC_ENV=production
```

## App Store Submission

See main project plan for detailed submission requirements for:
- Apple App Store
- Google Play Store

## Project Structure

```
mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation (Dashboard, Settings)
│   └── _layout.tsx        # Root layout with auth guards
├── components/            # Reusable components
│   ├── cards/            # YouCard, FriendCard
│   ├── modals/           # Friend, UserLocation, DeleteConfirm modals
│   └── ui/               # Button, Input, Modal primitives
├── hooks/                # Custom hooks
│   ├── useAuth.tsx       # Authentication state
│   ├── useFriends.ts     # Friends CRUD operations
│   ├── useWeather.ts     # Weather with caching
│   └── useUserLocation.ts # User location state
├── lib/                  # Core utilities
│   ├── auth.ts           # Better-Auth mobile client
│   ├── apiClient.ts      # Backend API integration
│   └── storage.ts        # AsyncStorage wrapper
└── constants/            # App constants
    ├── Colors.ts
    └── Config.ts

shared/                   # Shared code (root level)
├── data/
│   └── cities.json       # 316 cities database
├── utils/
│   ├── timeUtils.ts      # Timezone calculations
│   ├── weatherUtils.ts   # Weather utilities
│   └── gradients.ts      # Day/night gradients
└── types/                # TypeScript definitions
    ├── Friend.ts
    ├── City.ts
    ├── Weather.ts
    └── UserLocation.ts
```

## Features

- ✅ Google OAuth authentication
- ✅ Friend management (CRUD + drag-and-drop reordering)
- ✅ Real-time timezone display with 8 day/night phases
- ✅ Weather and air quality integration
- ✅ Time scrubber (±12h offset)
- ✅ 316 cities with autocomplete search
- ✅ Pull-to-refresh
- ✅ Offline caching (weather data)

## Tech Stack

- **Framework**: React Native + Expo
- **Routing**: Expo Router (file-based)
- **Styling**: NativeWind (TailwindCSS for RN)
- **Authentication**: Better-Auth
- **State**: React hooks + context
- **Storage**: AsyncStorage + SecureStore
- **HTTP**: Axios
- **Timezone**: Luxon
- **UI Components**: React Native primitives + custom components
