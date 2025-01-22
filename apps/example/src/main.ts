import { createAdhese } from '@adhese/sdk';
import { devtoolsPlugin } from '@adhese/sdk-devtools';

const adhese = createAdhese({
  account: 'uncommonmedia',
  host: "https://ads-uncommonmedia.staging-adhese.com",
  poolHost: "https://pool-uncommonmedia.staging-adhese.com",
  debug: true,
  consent: true,
  location: '_home_',
  plugins: [devtoolsPlugin],
  parameters: {
    "br": ["test"]
  }
});

window.adhese = adhese;

adhese.addSlot({
  format: '300x600',
  slot: "_one_",
  containingElement: 'halfpage1',
  renderMode: 'inline',
  parameters: {
    "ps": "top"
  }
});

adhese.addSlot({
  format: '300x600',
  slot: "_one_",
  containingElement: 'halfpage2',
  renderMode: 'inline',
  parameters: {
    "ps": "bottom"
  }
});