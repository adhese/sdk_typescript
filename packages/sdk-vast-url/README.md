# @adhese/sdk-vast-urls [![@adhese/sdk-vast-url version](https://img.shields.io/npm/v/%40adhese%2Fsdk-vast-url?label=%40adhese%2Fsdk-vast-url)](https://www.npmjs.com/package/@adhese/sdk-vast-url)

To generate VAST URLs, you need to install the `@adhese/sdk-vast-url` package.

## Installation
```bash
npm install @adhese/sdk-vast-url
```

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
