import { createAdhese } from '@adhese/sdk-core';

(function (): void {
  const adhese = createAdhese({
    account: 'demo',
  });

  // eslint-disable-next-line no-console
  console.log(adhese);
})();
