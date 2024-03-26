import { createAdhese } from 'core';
import { createDevtools } from '@adhese/sdk-devtools';

async function app(): Promise<void> {
  const adhese = await createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [{
      format: 'skyscraper',
      containingElement: 'skyscraper',
    }],
    location: '_sdk_example_',
    onCreateDevtools: async (context) => {
      const [unmount] = await Promise.all([
        // @ts-expect-error - context is not the correct type for some reason
        createDevtools(context),
        import('@adhese/sdk-devtools/dist/style.css'),
      ]);

      return unmount;
    },
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
