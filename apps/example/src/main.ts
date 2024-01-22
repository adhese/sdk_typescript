import { createAdhese, logger } from 'core';

(function (): void {
  const adhese = createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [{
      format: 'billboard',
      containingElement: 'billboard',
    }],
  });

  adhese.findDomSlots();

  logger.info('slots', adhese.getSlots());

  window.adhese = adhese;
})();
