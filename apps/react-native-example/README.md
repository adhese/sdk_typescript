# Adhese React Native Example

Expo app demonstrating [`@adhese/sdk-react-native`](../../packages/sdk-react-native/).

## Prerequisites

- Node.js >= 20
- npm >= 10
- iOS: Xcode with a simulator or physical device
- Android: Android Studio with an emulator or physical device

## Getting started

All commands from the **monorepo root** (`sdk_typescript/`).

### 1. Install dependencies

```bash
npm install
```

### 2. Build the SDK packages

```bash
npx turbo build --filter=@adhese/sdk-react-native
```

Turborepo builds `@adhese/sdk-shared` and `@adhese/sdk` automatically.

### 3. Start the Expo dev server

```bash
cd apps/react-native-example
npx expo start
```

- Press **i** for iOS Simulator
- Press **a** for Android Emulator
- Scan the QR code with [Expo Go](https://expo.dev/go) on a physical device

### Native builds (optional)

```bash
npx expo run:ios       # requires Xcode
npx expo run:android   # requires Android Studio
```

## What the example shows

| Slot | Display mode | Description |
|------|-------------|-------------|
| Billboard | `webview` (default) | HTML creative rendered in a WebView |
| Skyscraper | `webview` | Another WebView-rendered ad with different dimensions |
| Rectangle | Custom `render` prop | Full control over rendering using native components |

Impression and viewability tracking events are logged to the console. Open the Metro terminal or use `npx react-native log-ios` / `npx react-native log-android` to see them.

## Key files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout — wraps the app in `<AdheseProvider>` |
| `app/index.tsx` | Home screen with three `<AdheseSlot>` examples |
| `metro.config.js` | Metro config for monorepo subpath export resolution |
| `polyfills.js` | `crypto.getRandomValues` polyfill for Hermes |

## Configuration

The `AdheseProvider` is configured in `_layout.tsx`:

```tsx
<AdheseProvider options={{
  account: 'ali',
  debug: true,
  location: '_homepage_',
}}>
```

Change `account` to your Adhese account name.

## Troubleshooting

### Module not found for `@adhese/sdk-react-native`

Build the SDK packages first:

```bash
npx turbo build --filter=@adhese/sdk-react-native
```

### Metro can't resolve `@adhese/sdk/core` or `@adhese/sdk-shared/core`

Metro does not support Node.js subpath exports. The `metro.config.js` handles this with a custom `resolveRequest`. Make sure the SDK packages are **built** before starting Metro.

Clear the Metro cache if resolution issues persist:

```bash
npx expo start --clear
```

### WebView ads not rendering

`react-native-webview` requires a native module. If Expo Go doesn't support it for your SDK version, create a dev client with `npx expo run:ios` or `npx expo run:android`.
