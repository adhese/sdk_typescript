import { http, HttpResponse } from 'msw';

export const adRequestHandlers = [
  http.post('https://test.ads.adhese.eu/json', async ({
    request,
  }) => {
    const requestBody = await request.json() as {
      slots: ReadonlyArray<{
        slotname: string;
        parameters?: Record<string, ReadonlyArray<string> | string>;
      }>;
      parameters?: Record<string, ReadonlyArray<string> | string>;
    };

    return new HttpResponse(JSON.stringify(requestBody.slots.map(slot => ({
      adFormat: 'foo',
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: slot.slotname,
      slotName: slot.slotname,
      tag: '<a>foo</a>',
      libId: slot.slotname,
      id: slot.slotname,
      origin: 'JERLICIA',
      impressionCounter: '/impression',
      viewableImpressionCounter: '/viewable-impression',
    }))));
  }),
  http.post('https://empty.ads.adhese.eu/json', async () => new HttpResponse(JSON.stringify([]))),
  http.post('https://fail.ads.adhese.eu/json', async () => new HttpResponse(undefined, {
    status: 400,
  })),
  http.get('https://test.ads.adhese.eu/json/*', async ({ request }) => {
    const urlParts = request.url.split('/');
    const slotNames = urlParts.slice(urlParts.indexOf('json') + 1);

    return new HttpResponse(JSON.stringify(slotNames.map(slotName => ({
      adFormat: 'foo',
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: slotName,
      slotName: slotName.replace('sl', ''),
      tag: '<a>foo</a>',
      libId: slotName,
      id: slotName,
      origin: 'JERLICIA',
      impressionCounter: '/impression',
      viewableImpressionCounter: '/viewable-impression',
    }))));
  }),
  http.post('https://dale.ads.adhese.eu/json', async ({
    request,
  }) => {
    const requestBody = await request.json() as {
      slots: ReadonlyArray<{
        slotname: string;
        parameters?: Record<string, ReadonlyArray<string> | string>;
      }>;
      parameters?: Record<string, ReadonlyArray<string> | string>;
    };

    return new HttpResponse(JSON.stringify(requestBody.slots.map(slot => ({
      adFormat: 'foo',
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: slot.slotname,
      slotName: slot.slotname,
      body: '<a>foo</a>',
      libId: slot.slotname,
      origin: 'DALE',
      id: slot.slotname,
    }))));
  }),
  http.post('https://gateway.ads.adhese.eu/json', async ({
    request,
  }) => {
    const requestBody = await request.json() as {
      slots: ReadonlyArray<{
        slotname: string;
        parameters?: Record<string, ReadonlyArray<string> | string>;
      }>;
      parameters?: Record<string, ReadonlyArray<string> | string>;
    };

    return new HttpResponse(JSON.stringify(requestBody.slots.map(slot => ({
      origin: 'ADFORM',
      originInstance: '',
      ext: 'js',
      // eslint-disable-next-line ts/naming-convention
      slotID: slot.slotname,
      slotName: slot.slotname,
      adType: 'image',
      originData: {
        seatbid: [{ bid: [{ dealid: 'DID-3295-233118', crid: '87294141', ext: { prebid: { type: 'banner' } } }], seat: '9412' }],
      },
      width: '656',
      height: '164',
      body: '<script src="https://track.adform.net/adfscript/?bn=87294141"></script><div style="position:absolute;left:0;top:0;visibility:hidden"><img src="https://demo.ads.adhese.eu/rtb_gateway/handlers/client/track?id=test" width="1" height="1" alt="" style="display:none"></div>',
      extension: {
        mediaType: 'banner',
        prebid: { cpm: { amount: '0.3198538325072811054', currency: 'USD' } },
      },
    }))));
  }),
];
