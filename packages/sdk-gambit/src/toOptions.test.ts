import type { AdheseOptions } from '@adhese/sdk';
import { describe, expect, it } from 'vitest';
import { toOptions } from './toOptions';

describe('toOptions', () => {
  it('should return a Adhese options object', () => {
    expect(toOptions({
      data: {
        consent: true,
        domain: 'domain',
        pageType: 'pageType',
      },
      options: {
        debug: true,
        disableAds: true,
        adDisclaimer: 'adDisclaimer',
      },
      account: 'account',
      slots: [
        {
          slotType: 'slotType',
          position: 'position',
          containerId: 'containerId',
          data: {
            slotPayload: {
              format: 'format',
              slotname: 'slotname',
              parameters: {
                tl: 'true',
                pt: 'pageType',
                dm: 'domain',
              },
            },
          },
        },
      ],
    }, {
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
    })).toEqual({
      debug: true,
      account: 'account',
      parameters: {
        tl: 'true',
        pt: 'pageType',
        dm: 'domain',
      },
      initialSlots: [
        {
          format: 'slotType',
          containingElement: 'containerId',
        },
      ],
    } satisfies AdheseOptions);
  });

  it('should return a Adhese options object without parameters', () => {
    expect(toOptions({
      options: {
        debug: true,
        disableAds: true,
        adDisclaimer: 'adDisclaimer',
      },
      account: 'account',
      slots: [
        {
          slotType: 'slotType',
          position: 'position',
          containerId: 'containerId',
          data: {
            slotPayload: {
              format: 'format',
              slotname: 'slotname',
            },
          },
        },
      ],
    })).toEqual({
      debug: true,
      account: 'account',
      initialSlots: [
        {
          format: 'slotType',
          containingElement: 'containerId',
        },
      ],
    } satisfies AdheseOptions);
  });
});
