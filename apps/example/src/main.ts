import { createAdhese } from '@adhese/sdk';

(function (): void {
  const adhese = createAdhese({
    account: 'demo',
  });

  // eslint-disable-next-line no-console
  console.log(adhese);
})();
