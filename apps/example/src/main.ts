import { createAdhese } from 'core';

async function app(): Promise<void> {
  window.adhese = await createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [{
      format: 'skyscraper',
      containingElement: 'skyscraper',
      parameters: {
        dt: 'desktop',
        ab: [
          'foo',
          'bar',
        ],
      },
    }],
    location: '_sdk_example_',
    findDomSlotsOnLoad: true,
    parameters: {
      aa: 'foo',
    },
  });
}

app().catch((error) => {
  console.error(error);
});
