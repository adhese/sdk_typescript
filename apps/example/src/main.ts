import { createAdhese } from 'core';

(function (): void {
  createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [{
      format: 'billboard',
      containingElementId: 'billboard',
    }],
  });
})();
