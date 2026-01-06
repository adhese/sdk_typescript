# Ecommerce Demo App - Development Session

## Date: 2025-11-27

## Summary
Built a comprehensive "kitchen sink" ecommerce demo app to showcase the Adhese SDK's capabilities and test various ad rendering scenarios.

---

## Bug Fix: `renderInline` Duplicate Ads

### Problem
When using `renderMode: 'inline'` with `refreshOnResize: true`, ads were duplicating on browser resize.

### Root Cause
In `packages/sdk-shared/src/render/render.ts`, the `renderInline` function used `insertHtmlWithScripts()` which **appends** content instead of replacing it. When called multiple times (on resize), it kept adding duplicate ads.

### Fix
Added `element.replaceChildren()` before inserting content:

```typescript
export function renderInline(ad: RenderOptions, element: HTMLElement): void {
  element.replaceChildren();  // <-- This line fixes the bug
  insertHtmlWithScripts(element, String(ad.tag));
}
```

### File Changed
- `packages/sdk-shared/src/render/render.ts` (line 118)

---

## Ecommerce Demo Features

### Ad Slots Implemented

| Slot | Format | Render Mode | Origin | Lazy Loading | Notes |
|------|--------|-------------|--------|--------------|-------|
| Leaderboard | `leaderboard` | inline | JERLICIA | No | Top banner |
| Product Tile 1 | `halfwidthsmallresponsive` | inline | JERLICIA | No | In product grid |
| Carousel | `mediumrectangle` | inline | JERLICIA | No | Swiper carousel slide |
| Product Tile 2 | `imu` | inline | JERLICIA | Yes | In product grid |
| Skyscraper | `skyscraper` | **iframe** | **DALE** | Yes | Sidebar sticky |
| Billboard | `billboard` | **iframe** | **DALE** | Yes | Before footer |
| Native | `native` | **none** | JERLICIA | No | Custom React render |
| Responsive | `leaderboard`/`mobile-banner` | inline | JERLICIA | No | Changes on viewport |

### Render Modes Demonstrated

1. **`inline`** - Direct DOM injection (for trusted content)
2. **`iframe`** - Sandboxed rendering (for programmatic/3rd-party)
3. **`none`** - Custom rendering (for native ads)

### Origins Demonstrated

1. **JERLICIA** - Adhese's own ad server response format
   - Uses `tag` field for ad content

2. **DALE** - OpenRTB-style programmatic response
   - Uses `body` field (SDK transforms to `tag`)
   - Includes `originData.seatbid` structure

### Other Features

- **Responsive Format** - Slot that changes format based on viewport media query
- **Lazy Loading** - Some slots only load when in viewport
- **Viewability Tracking** - Enabled globally
- **Swiper Carousel** - Ad embedded in carousel slide (tests in/out of view)
- **Custom Native Ad** - React component that parses ad data and renders custom UI

---

## Files Created/Modified

### New Files
- `apps/ecommerce/` - Entire demo app
- `apps/ecommerce/src/mocks/handlers.ts` - MSW mock handlers for ad responses
- `apps/ecommerce/src/mocks/browser.ts` - MSW browser setup
- `apps/ecommerce/src/pages/HomePage.tsx` - Main demo page
- `apps/ecommerce/src/App.tsx` - App with AdheseProvider config
- `apps/ecommerce/src/styles.css` - Tailwind + carousel styles

### Bug Fix
- `packages/sdk-shared/src/render/render.ts` - Added `replaceChildren()` fix

---

## SDK Configuration Used

```typescript
<AdheseProvider options={{
  account: 'demo',
  debug: true,
  location: '_sdk_ecommerce_',
  consent: false,
  eagerRendering: true,
  findDomSlotsOnLoad: false,
  refreshOnResize: true,
  viewabilityTracking: true,
  initialSlots: [
    // Inline rendering (direct DOM injection)
    { format: 'leaderboard', containingElement: 'slot-leaderboard', renderMode: 'inline' },
    { format: 'halfwidthsmallresponsive', containingElement: 'slot-halfwidth', renderMode: 'inline' },
    { format: 'mediumrectangle', containingElement: 'slot-carousel', renderMode: 'inline' },
    { format: 'imu', containingElement: 'slot-imu', lazyLoading: true, renderMode: 'inline' },
    // Iframe rendering (sandboxed)
    { format: 'skyscraper', containingElement: 'slot-skyscraper', lazyLoading: true, renderMode: 'iframe' },
    { format: 'billboard', containingElement: 'slot-billboard', lazyLoading: true, renderMode: 'iframe' },
    // Custom rendering (renderMode: 'none' - we handle it ourselves)
    { format: 'native', containingElement: 'slot-native', renderMode: 'none' },
    // Responsive format (changes based on viewport)
    {
      format: [
        { format: 'leaderboard', query: '(min-width: 768px)' },
        { format: 'mobile-banner', query: '(max-width: 767px)' },
      ],
      containingElement: 'slot-responsive',
      renderMode: 'inline',
    },
  ],
}}>
```

---

## Mock Response Structure

### JERLICIA Response
```json
{
  "origin": "JERLICIA",
  "tag": "<div>...ad HTML...</div>",
  "slotName": "_sdk_ecommerce_-leaderboard",
  "impressionCounter": "https://...",
  "viewableImpressionCounter": "https://..."
}
```

### DALE Response
```json
{
  "origin": "DALE",
  "body": "<div>...ad HTML...</div>",
  "originData": {
    "seatbid": [{
      "bid": [{
        "id": "bid-123",
        "price": 2.50,
        "adm": "<div>...ad HTML...</div>",
        "ext": {
          "adhese": {
            "viewableImpressionCounter": "https://..."
          }
        }
      }],
      "seat": "mock-dsp"
    }]
  }
}
```

### Native Response
```json
{
  "origin": "JERLICIA",
  "tag": "<div data-native='true'></div>",
  "ext": "{\"native\":{\"title\":\"...\",\"description\":\"...\",\"image\":\"...\"}}"
}
```

---

## Learnings

1. **DALE uses `body`, JERLICIA uses `tag`** - SDK schema expects different fields
2. **`ext` must be JSON string** - Not an object, SDK parses it
3. **Format extraction for hyphenated names** - Need to split on location prefix, not just `-`
4. **`useAdhese()` returns Adhese instance** - Use `getAll().find()` to locate slots
5. **Carousel needs custom nav buttons outside Swiper** - For proper click handling

---

## Running the Demo

```bash
npm run dev --workspace=ecommerce
```

Then open http://localhost:5173

---

## TODO / Future Improvements

- [ ] Add slot hooks examples (onRender, onBeforeRender)
- [ ] Add custom parameters example
- [ ] Add preview mode example
- [ ] Add error state handling demo
- [ ] Test with real Adhese account
