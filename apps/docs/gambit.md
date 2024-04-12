<script setup>
import sdkGambitPackage from '../../packages/sdk-gambit/package.json';
</script>

# Gambit <Badge>{{sdkGambitPackage.version}}</Badge>

For developers who want to use the Adhese SDK and used to work with Gambit configuration this package offers utility
functions to convert Gambit configuration to Adhese configuration.

## Installation
::: code-group
```bash [npm]
npm install @adhese/sdk-gambit
```
```bash [pnpm]
pnpm add @adhese/sdk-gambit
```
```bash [yarn]
yarn add @adhese/sdk-gambit
```
```bash [bun]
bun add @adhese/sdk-gambit
```
:::

## `parseFromGambitToAdheseOptions`
Converts `GambitConfig` to `AdheseOptions`.

```js
import { parseFromGambitToAdheseOptions } from '@adhese/sdk-gambit';
import { createAdhese } from '@adhese/sdk';

const gambitConfig = {
  account: 'your-account-id',
  slots: {
    'slot-name': {
      id: 'slot-id',
      sizes: [
        {
          width: 300,
          height: 250,
        },
      ],
    },
  },
};

const adheseOptions = parseFromGambitToAdheseOptions(gambitConfig);

const adhese = createAdhese(adheseOptions);
```

## `parseGambitParameters`
Converts `GambitData` to `Parameters`.

```js
import { parseGambitParameters } from '@adhese/sdk-gambit';
import { createAdhese } from '@adhese/sdk';

const gambitData = {
  'key1': 'value1',
  'key2': 'value2',
};

const parameters = parseGambitParameters(gambitData, {
  'k1': 'key1',
  'k2': 'key2',
});

const adhese = createAdhese({
  account: 'your-account-id',
  parameters,
});
```

## `parseFromGambitSlotToAdheseSlot`
Converts `GambitSlot` to `AdheseSlot`.

```js
import { parseFromGambitSlotToAdheseSlot } from '@adhese/sdk-gambit';

adheses.addSlot(parseFromGambitSlotToAdheseSlot(gambitSlot));
```