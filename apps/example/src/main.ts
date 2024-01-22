import { createAdhese, logger } from 'core';

async function app(): Promise<void> {
  const adhese = await createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [{
      format: 'skyscraper',
      containingElement: 'skyscraper',
    }],
    location: '_sdk_example_',
  });

  await adhese.findDomSlots();

  logger.info('slots', adhese.getSlots());

  window.adhese = adhese;
}

app().catch((error) => {
  console.error(error);
});
