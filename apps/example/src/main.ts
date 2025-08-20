import { createAdhese } from '@adhese/sdk';
import { devtoolsPlugin } from '@adhese/sdk-devtools';
import { stackSlotsPlugin } from '@adhese/sdk-stack-slots';

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
  plugins: [devtoolsPlugin, stackSlotsPlugin],
});

window.adhese = adhese;

adhese.addSlot({
  format: 'billboard',
  containingElement: 'leaderboard',
  renderMode: 'inline',
});
