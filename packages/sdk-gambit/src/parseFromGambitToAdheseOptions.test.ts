import { describe, expect, it } from 'vitest';
import type { AdheseOptions } from '@adhese/sdk';
import { parseFromGambitToAdheseOptions } from './parseFromGambitToAdheseOptions';

describe('parseFromGambitToAdheseOptions', () => {
  it('should return a Adhese options object', () => {
    expect(parseFromGambitToAdheseOptions({
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
});
