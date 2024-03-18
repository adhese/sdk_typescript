import { createAdhese } from 'core';

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

  window.adhese = adhese;

  await adhese.addSlot({
    format: 'leaderboard',
    containingElement: 'leaderboard',
    renderMode: 'inline',
  });

  await adhese.addSlot({
    format: 'imu',
    containingElement: 'imu',
    lazyLoading: true,
    lazyLoadingOptions: {
      rootMargin: '0px',
    },
  });
}

app().catch((error) => {
  console.error(error);
});
