# @adhese/sdk-shared

Shared utilities and types used across the Adhese SDK packages. This package provides common functionality including
logging, event management, cookie handling, rendering utilities, and reactive primitives.

## Installation
```bash
npm install @adhese/sdk-shared
```

## Usage
This package is primarily used internally by other `@adhese/sdk-*` packages. However, you can import utilities directly
if needed.

### Available Utilities
- **Logging**: `createLogger`, `useLogger`
- **Cookies**: `getCookie`, `setCookie`, `deleteCookie`, `hasCookie`
- **Events**: `createEventManager`
- **Rendering**: `renderIframe`, `renderInline`
- **Hooks**: `createSyncHook`, `createAsyncHook`, `createPassiveHook`
- **Validators**: Available via `@adhese/sdk-shared/validators`
- **Reactivity**: Re-exports from `@vue/runtime-core`
- **Utilities**: Re-exports from `remeda`
