import { describe, expect, it } from 'vitest';
import { toSlotOptions } from './toSlotOptions';
import type { GambitSlot } from './gambit.types';

describe('toSlotOptions', () => {
  it('should return a Adhese slot object', () => {
    const slot: GambitSlot = {
      slotType: 'slotType',
      containerId: 'containerId',
      data: {
        parameters: {
          consent: 'true',
          pageType: 'pageType',
          domain: 'domain',
        },
      },
    };
    const parameterMap = {
      position: 'ps',
      consent: 'tl',
      pageType: 'pt',
      category: 'ct',
      subCategory: 'ct',
      productGroup: 'ct',
      searchTerm: 'kw',
      userId: 'mi',
      userMode: 'um',
      inOrderMode: 'om',
      customerType: 'cu',
      pagePath: 'pp',
      domain: 'dm',
    };
    expect(toSlotOptions(slot, parameterMap)).toEqual({
      format: 'slotType',
      containingElement: 'containerId',
      parameters: {
        tl: 'true',
        pt: 'pageType',
        dm: 'domain',
      },
    });
  });
});
