import { createAdhese } from '@adhese/sdk';
import { devtoolsPlugin } from '@adhese/sdk-devtools';

const adhese = createAdhese({
  account: 'demo',
  debug: true,
  consent: true,
  initialSlots: [
    {
      format: 'halfpage',
      containingElement: 'skyscraper',
    }
  ],
  location: 'demo.com_kitchen',
  refreshOnResize: false,
  plugins: [devtoolsPlugin],
});

window.adhese = adhese;

adhese.addSlot({
  format: 'billboard',
  containingElement: 'leaderboard',
  renderMode: 'inline',
});
