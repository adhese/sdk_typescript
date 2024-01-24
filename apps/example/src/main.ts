import { createAdhese } from 'core';

async function app(): Promise<void> {
  window.adhese = await createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [{
      format: 'skyscraper',
      containingElement: 'skyscraper',
    }],
    location: '_sdk_example_',
    findDomSlotsOnLoad: true,
  });
}

app().catch((error) => {
  console.error(error);
});
