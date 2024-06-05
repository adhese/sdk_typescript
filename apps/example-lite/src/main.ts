import { createSlot } from '@adhese/sdk-lite';

createSlot({
  containingElement: document.querySelector('.adunit#skyscraper')!,
  format: 'skyscraper',
  account: 'demo',
  location: '_sdk_example_',
  debug: true,
});
