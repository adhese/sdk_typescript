import { createAdhese } from '@adhese/sdk-core';

(function (): void {
  const adhese = createAdhese({
    account: 'demo',
    // hostUrls: ['https://ads-{{account}}.adhese.com'],
  });

  // eslint-disable-next-line no-console
  console.log(adhese);
})();
