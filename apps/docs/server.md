---
title: Server-Side Rendering
---

<script setup>
import sdkPackage from '../../packages/sdk/package.json';
</script>

# Server-Side Rendering <Badge>{{sdkPackage.version}}</Badge>

The SDK provides a `fetchAds()` function for server-side rendering (SSR) workflows. This allows you to fetch ad data on the server and hydrate it on the client, enabling faster initial page loads and preventing layout shift.

> [!WARNING]
> **Impression Tracking**: The server export only fetches ad data - it does not handle impression tracking. If you render ads without using the client SDK, you must implement tracking manually. See [Impression Tracking](#impression-tracking) for details.

## Installation

The server functionality is included in the main SDK package:

::: code-group
```bash [npm]
npm install @adhese/sdk
```
```bash [pnpm]
pnpm add @adhese/sdk
```
```bash [yarn]
yarn add @adhese/sdk
```
```bash [bun]
bun add @adhese/sdk
```
:::

## Usage

Import `fetchAds` from `@adhese/sdk/server`:

```typescript
import { fetchAds } from '@adhese/sdk/server';

const ads = await fetchAds({
  account: 'your-account',
  location: 'homepage',
  slots: [
    { format: 'leaderboard' },
    { format: 'sidebar', slot: '1' },
  ],
});
```

## POST vs GET Requests

The `fetchAds` function supports both POST and GET request methods:

| Method | Global Parameters | Slot Parameters | Use Case |
| --- | --- | --- | --- |
| POST (default) | Supported | Supported | Most use cases, supports all features |
| GET | Not supported | Not supported | Simple requests, cacheable by CDN |

## Options

### Main Options

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `account` | `string` | Yes | Your Adhese account name |
| `location` | `string` | Yes | The page/location identifier |
| `slots` | `FetchAdsSlot[]` | Yes | Array of slot configurations |
| `timeout` | `number` | No | Request timeout in milliseconds |
| `parameters` | `Record<string, string \| string[]>` | No | Global parameters (POST only) |
| `requestType` | `'POST' \| 'GET'` | No | Request method (default: `'POST'`) |

### Slot Options

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `format` | `string` | Yes | The ad format identifier |
| `slot` | `string` | No | Slot identifier for multiple slots of the same format |
| `parameters` | `Record<string, string \| string[]>` | No | Slot-specific parameters |

## Examples

### Basic Usage

```typescript
import { fetchAds } from '@adhese/sdk/server';

const ads = await fetchAds({
  account: 'demo',
  location: 'homepage',
  slots: [{ format: 'leaderboard' }],
});

console.log(ads[0]?.adType, ads[0]?.width, ads[0]?.height);
```

### POST with Global Parameters

```typescript
import { fetchAds } from '@adhese/sdk/server';

const ads = await fetchAds({
  account: 'demo',
  location: 'homepage',
  requestType: 'POST',
  parameters: {
    dt: 'desktop',
    tl: 'all',
  },
  slots: [
    {
      format: 'leaderboard',
      parameters: {
        position: 'top',
      },
    },
  ],
});
```

### GET Request

```typescript
import { fetchAds } from '@adhese/sdk/server';

const ads = await fetchAds({
  account: 'demo',
  location: 'homepage',
  requestType: 'GET',
  slots: [{ format: 'leaderboard' }],
});
```

### Timeout Handling

Use timeout to prevent blocking page load:

```typescript
import { fetchAds } from '@adhese/sdk/server';

const ads = await fetchAds({
  account: 'demo',
  location: 'homepage',
  slots: [{ format: 'leaderboard' }],
  timeout: 2000,
});

if (ads.length === 0) {
  // Render fallback content
}
```

## Hydration Patterns

### Server Fetch + Client Render

A common pattern is to fetch ads on the server and render them on the client:

```tsx
// app/page.tsx (Next.js App Router Server Component)
import { fetchAds } from '@adhese/sdk/server';

export default async function HomePage() {
  const ads = await fetchAds({
    account: 'demo',
    location: 'homepage',
    slots: [{ format: 'leaderboard' }],
    timeout: 2000,
  });

  const ad = ads[0];

  return (
    <div>
      {ad && (
        <div
          style={{ width: ad.width, height: ad.height }}
          dangerouslySetInnerHTML={{ __html: ad.tag as string }}
        />
      )}
    </div>
  );
}
```

### Preventing Layout Shift

Use the `width` and `height` from the ad response to reserve space:

```jsx
function AdSlot({ ad }) {
  // Reserve space even before ad loads
  const style = {
    width: ad?.width ?? 728,  // fallback to expected dimensions
    height: ad?.height ?? 90,
    minHeight: ad?.height ?? 90,
  };

  return (
    <div style={style}>
      {ad && <div dangerouslySetInnerHTML={{ __html: ad.tag }} />}
    </div>
  );
}
```

## Error Handling

### Timeout Behavior

When a timeout is specified and exceeded, `fetchAds` returns an empty array instead of throwing:

```typescript
const ads = await fetchAds({
  account: 'demo',
  location: 'homepage',
  slots: [{ format: 'leaderboard' }],
  timeout: 2000,
});

```

This enables graceful degradation without blocking page rendering.

### Network Errors

Network errors and non-2xx responses will throw an error:

```typescript
try {
  const ads = await fetchAds({
    account: 'demo',
    location: 'homepage',
    slots: [{ format: 'leaderboard' }],
  });
} catch (error) {
  console.error('Failed to fetch ads:', error);
}
```

## Impression Tracking

When using the client SDK, impression tracking is handled automatically. However, when rendering ads server-side or in a custom implementation, you need to track impressions manually.

Each ad in the response includes tracking URLs that should be called at the appropriate time:

| Property | When to Call |
| --- | --- |
| `impressionCounter` | When the ad is rendered/displayed |
| `viewableImpressionCounter` | When the ad becomes viewable (typically 50% visible for 1 second) |
| `tracker` | General tracking pixel, call on render |

### Next.js Example

```tsx
'use client';

import { addTrackingPixel } from '@adhese/sdk-shared';
import { useEffect, useRef } from 'react';
import type { AdheseAd } from '@adhese/sdk';

function AdSlot({ ad }: { ad: AdheseAd }) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!ref.current || tracked.current) return;

    if (ad.impressionCounter) addTrackingPixel(ad.impressionCounter);
    if (ad.tracker) addTrackingPixel(ad.tracker);

    // IAB viewability standard: 50% visible for 1 second
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ad.viewableImpressionCounter) {
          setTimeout(() => {
            addTrackingPixel(ad.viewableImpressionCounter!);
            observer.disconnect();
          }, 1000);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    tracked.current = true;

    return () => observer.disconnect();
  }, [ad]);

  return (
    <div
      ref={ref}
      style={{ width: ad.width, height: ad.height }}
      dangerouslySetInnerHTML={{ __html: ad.tag as string }}
    />
  );
}
```

For more information about slot lifecycle events when using the client SDK, see the [Events documentation](/events).

## Notes

> [!NOTE]
> **Node.js Version**: Requires Node.js 18+ for native `fetch` support.
