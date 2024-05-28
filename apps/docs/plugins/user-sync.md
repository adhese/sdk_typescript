<script setup>
import sdkUserSyncPackage from '../../../packages/sdk-user-sync/package.json';
</script>

# User Sync <Badge>{{sdkUserSyncPackage.version}}</Badge>

To enable user sync events with Adhese, you need to install the `@adhese/sdk-user-sync` package.

> [!IMPORTANT]
> To use User Sync events, you need to have a service handler, this needs to be provided by Adhese Support. Make sure to
> contact them before implementing this into your application.

## Installation
::: code-group
```bash [npm]
npm install @adhese/sdk-user-sync
```
```bash [pnpm]
pnpm add @adhese/sdk-user-sync
```
```bash [yarn]
yarn add @adhese/sdk-user-sync
```
```bash [bun]
bun add @adhese/sdk-user-sync
```
:::

## Usage
To enable user sync event, you need to include the `@adhese/sdk-user-sync` package in your Adhese instance.

```js
import {createAdhese} from '@adhese/sdk';

const adhese = createAdhese({
  account: 'demo',
  plugins: [userSyncPlugin],
  location: 'location',
})
```

### Send a user sync event

```js
await adhese.plugins.userSync.sync({
  serviceHandler: 'serviceHandler',
  events: ['event1', 'event2'],
  userId: 'userId',
  expiration: 60,
})
```

> [!WARNING]
> Make sure that you have consent from the user by either passing the binary `consent` parameter to Adhese or by the TCF
> API. If no valid consent is found the function will throw an error.
