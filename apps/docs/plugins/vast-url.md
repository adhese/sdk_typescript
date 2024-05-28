---
title: VAST URL
---

<script setup>
import sdkVastUrlPackage from '@adhese/sdk-vast-url/package.json';
</script>

# VAST URL <Badge>{{sdkVastUrlPackage.version}}</Badge>

To generate VAST URLs, you need to install the `@adhese/sdk-vast-url` package.

## Installation
::: code-group
```bash [npm]
npm install @adhese/sdk-vast-url
```
```bash [pnpm]
pnpm add @adhese/sdk-vast-url
```
```bash [yarn]
yarn add @adhese/sdk-vast-url
```
```bash [bun]
bun add @adhese/sdk-vast-url
```
:::

## Usage
To generate VAST URLs, you need to include the `@adhese/sdk-vast-url` package in your Adhese instance.

```js
import {createAdhese} from '@adhese/sdk';

const adhese = createAdhese({
  account: 'demo',
  plugins: [vastUrlPlugin],
  location: 'location',
})
```

### Generate a VAST URL

```js
const url = adhese.plugins.vastUrl.createUrl({
  format: 'vast',
  parameters: {
    aa: 'value'
  },
}) // output: https://ads-demo.adhese.com/ad/sllocation-vast/aavalue
```
