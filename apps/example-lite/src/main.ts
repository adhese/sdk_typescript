import { createAdheseLite } from '@adhese/sdk-lite';

const adhese = createAdheseLite({
  account: 'demo',
  location: '_sdk_example_',
  debug: true,
  initialSlots: [
    {
      containingElement: document.querySelector('.adunit#skyscraper')!,
      format: 'skyscraper',
    },
  ],
});

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
window.adhese = adhese;

adhese.addSlot({
  containingElement: document.querySelector('.adunit#leaderboard')!,
  format: 'leaderboard',
});
