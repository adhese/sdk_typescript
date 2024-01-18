import { createAdhese, logger } from 'core';

(function (): void {
  const adhese = createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [{
      format: 'billboard',
      containingElementId: 'billboard',
    }],
  });

  adhese.findDomSlots();

  logger.info('slots', adhese.getSlots());
})();
