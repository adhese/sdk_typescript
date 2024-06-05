# @adhese/sdk-lite
Lightweight Adhese SDK that can only render a single slot

## Installation
```bash
npm install @adhese/sdk-lite
```

## Usage
```js
import {createSlot} from '@adhese/sdk-lite';

const slot = createSlot({
  account: 'demo',
  location: 'location',
  format: 'format',
  containingElement: document.getElementById('container'),
  debug: true,
});
```
