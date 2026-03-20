# @adhese/sdk-react-native

React Native bindings for the Adhese ad SDK. Provides components and hooks to load and display ads in React Native apps using the same core as the web SDK.

## Installation

```bash
npm install @adhese/sdk-react-native
```

### Peer dependencies

Install the required peer dependencies:

```bash
npm install react-native-webview
```

> **Expo users:** `react-native-webview` is included in Expo Go for supported SDK versions. For custom dev clients, run `npx expo install react-native-webview`.

### Hermes polyfills

The Hermes JavaScript engine (default in React Native) lacks `crypto.getRandomValues` and `DOMParser`. Create a polyfill file and import it **before** any SDK code:

```js
// polyfills.js
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto.getRandomValues = function getRandomValues(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}
```

Import at the top of your root layout or entry file:

```tsx
import './polyfills';
```

### Metro configuration

Metro does not support Node.js `exports` subpath maps. If you are in a monorepo where `@adhese/sdk` and `@adhese/sdk-shared` are local workspace packages, add a custom `resolveRequest` to your `metro.config.js`:

```js
const path = require('path');
const monorepoRoot = path.resolve(__dirname, '../..');

const subpathExports = {
  '@adhese/sdk/core': path.resolve(monorepoRoot, 'packages/sdk/dist/core.js'),
  '@adhese/sdk-shared/core': path.resolve(monorepoRoot, 'packages/sdk-shared/dist/core.js'),
  '@adhese/sdk-shared/validators': path.resolve(monorepoRoot, 'packages/sdk-shared/dist/validators.js'),
};

module.exports = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (subpathExports[moduleName]) {
        return { filePath: subpathExports[moduleName], type: 'sourceFile' };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};
```

If `@adhese/sdk-react-native` is installed from npm (not a local workspace), this step is not needed.

---

## Quick start

### 1. Wrap your app in `AdheseProvider`

```tsx
import './polyfills';
import { AdheseProvider } from '@adhese/sdk-react-native';
import { useMemo } from 'react';

export default function App() {
  const options = useMemo(() => ({
    account: 'your-account',
    location: '_homepage_',
  }), []);

  return (
    <AdheseProvider options={options}>
      {/* your screens */}
    </AdheseProvider>
  );
}
```

### 2. Render an ad slot

```tsx
import { AdheseSlot } from '@adhese/sdk-react-native';
import { Text } from 'react-native';

function AdBanner() {
  return (
    <AdheseSlot
      format="billboard"
      width={728}
      height={90}
      placeholder={<Text>Loading ad...</Text>}
    />
  );
}
```

That's it. The slot requests an ad from the Adhese API, renders the creative in a `WebView`, and handles impression and viewability tracking automatically.

---

## API reference

### `<AdheseProvider>`

Context provider that creates and manages an Adhese instance for the component tree.

| Prop | Type | Description |
|------|------|-------------|
| `options` | `AdheseOptions` | SDK configuration (account, location, plugins, etc.) |
| `children` | `ReactNode` | Child components |

The instance is recreated when `options` changes and disposed on unmount.

```tsx
const options = useMemo(() => ({
  account: 'your-account',
  location: '_homepage_',
  debug: true,              // enable console debug logging
  consent: true,            // GDPR consent (boolean or TCF string)
}), []);

<AdheseProvider options={options}>
  <App />
</AdheseProvider>
```

---

### `<AdheseSlot>`

Renders an ad in a React Native view. Handles the full lifecycle: request, render, impression tracking, and viewability tracking.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `format` | `string` | *required* | Ad format name (e.g. `"billboard"`, `"leaderboard"`) |
| `width` | `number` | — | Width of the ad container in pixels |
| `height` | `number` | — | Height of the ad container in pixels |
| `displayMode` | `'webview' \| 'image' \| 'none'` | `'webview'` | How the ad creative is rendered |
| `placeholder` | `ReactNode` | — | Shown while the ad is loading |
| `render` | `(slot: AdheseSlot) => ReactNode` | — | Custom render function (overrides `displayMode`) |
| `onChange` | `(slot: AdheseSlot \| null) => void` | — | Called when slot is created or disposed |
| `setup` | `(context, hooks) => void` | — | Setup callback for hooking into the slot lifecycle |
| `parameters` | `Record<string, string \| string[]>` | — | Extra targeting parameters |
| `slot` | `string` | — | Custom slot name (overrides the auto-generated name) |
| `style` | `ViewStyle` | — | Additional styles on the wrapper `<View>` |

Plus all standard React Native `ViewProps` (testID, accessibilityLabel, etc.).

#### Display modes

**`webview`** (default) — Renders the ad's HTML tag inside a `WebView`. Links open in the system browser. Best for rich-media and HTML creatives.

**`image`** — Attempts to extract an image URL from a simple `<img>` tag and renders it as a native `<Image>`. Falls back to WebView if the creative is not a simple image. Useful for static banner images.

**`none`** — Does not render anything. Use this together with the `render` prop for full control.

#### Custom rendering

The `render` prop gives you complete control over how the ad data is displayed:

```tsx
<AdheseSlot
  format="rectangle"
  width={300}
  height={250}
  render={(slot) => (
    <View>
      <Text>Ad: {slot.name}</Text>
      <Text>Status: {slot.status}</Text>
      {slot.data?.tag && (
        <Image
          source={{ uri: extractUrl(slot.data.tag) }}
          style={{ width: 300, height: 250 }}
        />
      )}
    </View>
  )}
/>
```

---

### `useAdhese()`

Returns the Adhese instance from the nearest `AdheseProvider`, or `undefined` if the provider is still initializing.

```tsx
import { useAdhese } from '@adhese/sdk-react-native';

function MyComponent() {
  const adhese = useAdhese();

  if (!adhese) return <Text>Loading SDK...</Text>;

  return <Text>Account: {adhese.options.account}</Text>;
}
```

---

### `useAdheseSlot(options)`

Low-level hook that creates an Adhese slot imperatively. Useful when you need direct access to the slot object without using the `<AdheseSlot>` component.

```tsx
import { useAdheseSlot, useWatch } from '@adhese/sdk-react-native';

function CustomSlot() {
  const slot = useAdheseSlot({
    format: 'billboard',
    width: 728,
    height: 90,
  });

  const status = useWatch(slot ? () => slot.status : undefined);
  const data = useWatch(slot ? () => slot.data : undefined, { deep: true });

  if (!slot || !data) return <Text>Loading...</Text>;

  return <Text>Slot {slot.name}: {status}</Text>;
}
```

The slot is automatically disposed when the component unmounts.

> **Important:** Wrap your `setup` callback in `useCallback` to prevent infinite re-render loops.

---

### `useWatch(value, options?)`

Bridges Vue reactivity (used internally by the SDK) to React state. Observes a reactive getter and returns the current value as React state that triggers re-renders.

```tsx
const status = useWatch(slot ? () => slot.status : undefined);
const data = useWatch(slot ? () => slot.data : undefined, { deep: true });
```

| Param | Type | Description |
|-------|------|-------------|
| `value` | `() => T \| undefined` | A getter function returning the reactive value to observe |
| `options` | `{ deep?: boolean }` | Pass `{ deep: true }` for nested objects like `slot.data` |

---

### `createAdheseNative(options)`

Factory function that creates an Adhese instance configured for React Native. This is used internally by `AdheseProvider`; you only need it if you manage the instance manually.

```tsx
import { createAdheseNative } from '@adhese/sdk-react-native';

const adhese = createAdheseNative({
  account: 'your-account',
  location: '_homepage_',
});
```

---

## Lifecycle hooks

The `setup` prop on `<AdheseSlot>` gives access to slot lifecycle hooks:

```tsx
import { useCallback } from 'react';

const setup = useCallback(
  (context, hooks) => {
    hooks.onBeforeRequest?.((ad) => {
      console.log('About to request ad');
      return ad; // return modified ad or null
    });

    hooks.onRequest?.((ad) => {
      console.log('Ad response received:', ad.slotName);
      return ad;
    });

    hooks.onBeforeRender?.((ad) => {
      console.log('About to render ad');
      return ad;
    });

    hooks.onRender?.((ad) => {
      console.log('Ad rendered');
    });

    hooks.onImpressionTracked?.((ad) => {
      console.log('Impression tracked:', ad.impressionCounter);
    });

    hooks.onViewableTracked?.((ad) => {
      console.log('Viewable impression tracked:', ad.viewableImpressionCounter);
    });

    hooks.onEmpty?.(() => {
      console.log('No ad returned');
    });

    hooks.onError?.((error) => {
      console.error('Slot error:', error);
    });

    hooks.onDispose?.(() => {
      console.log('Slot disposed');
    });
  },
  [],
);

<AdheseSlot format="billboard" setup={setup} width={728} height={90} />
```

### Available hooks

| Hook | Signature | Description |
|------|-----------|-------------|
| `onBeforeRequest` | `(ad: AdheseAd \| null) => AdheseAd \| null` | Before the ad request is made. Return a modified ad to use instead, or `null` to proceed with the request. |
| `onRequest` | `(ad: AdheseAd) => AdheseAd` | After the ad response is received. Can modify the ad data. |
| `onBeforeRender` | `(ad: AdheseAd) => AdheseAd` | Before rendering. Can modify the ad data. |
| `onRender` | `(ad: AdheseAd) => void` | After the ad is rendered. |
| `onImpressionTracked` | `(ad: AdheseAd) => void` | After the impression tracking pixel is fired. |
| `onViewableTracked` | `(ad: AdheseAd) => void` | After the viewability tracking pixel is fired (~1 second after render). |
| `onEmpty` | `() => void` | When no ad is returned for the slot. |
| `onError` | `(error: Error) => void` | When an error occurs during the slot lifecycle. |
| `onDispose` | `() => void` | When the slot is being disposed (component unmount). |
| `onInit` | `() => void` | When the slot is initialized. |

---

## Tracking

### Impression tracking

Fires automatically when the slot status transitions to `rendered`. The SDK sends a `GET` request to the `impressionCounter` URL provided in the ad response. If an `additionalTracker` URL is present, it is also fired.

### Viewability tracking

Fires automatically ~1 second after the impression. This approximates the IAB viewability standard (50% of the ad visible for at least 1 second). The SDK sends a `GET` request to the `viewableImpressionCounter` URL from the ad response.

Both trackers use `fetch()` instead of DOM image elements (which are not available in React Native). Tracking is best-effort — network failures are silently ignored.

Tracking state resets when new ad data is loaded, allowing re-tracking on ad refresh.

---

## Platform differences from web SDK

| Feature | Web (`@adhese/sdk-react`) | React Native (`@adhese/sdk-react-native`) |
|---------|---------------------------|-------------------------------------------|
| Ad rendering | DOM manipulation | `WebView` or native `Image` |
| Viewability detection | `IntersectionObserver` | Timer-based (1s after render) |
| Tracking pixels | Hidden `<img>` elements | `fetch()` requests |
| Lazy loading | `IntersectionObserver` | Not supported |
| Device detection | `window.matchMedia` | `Dimensions` API |
| Link clicks | Browser navigation | `Linking.openURL()` (system browser) |
| Consent | TCF `__tcfapi` | Binary boolean or TCF consent string |
| Referrer/URL logging | `document.referrer`, `window.location` | Disabled |
| DOM slot discovery | `document.querySelectorAll` | Not applicable |

---

## Example

See [`apps/react-native-example/`](../../apps/react-native-example/) for a complete Expo app demonstrating all features.
