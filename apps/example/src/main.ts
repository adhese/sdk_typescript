import { createDevtools } from '@adhese/sdk-devtools';
import { createAdhese } from '@adhese/sdk';

async function app(): Promise<void> {
  const adhese = await createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [{
      format: 'skyscraper',
      containingElement: 'skyscraper',
    }],
    location: '_sdk_example_',
    onCreateDevtools: async context => createDevtools(context),
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
