import { HttpResponse, http } from 'msw';

export const adRequestHandlers = [
  http.post('https://ads-test.adhese.com/json', async ({
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
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: slot.slotname,
      slotName: slot.slotname,
      tag: '<a>foo</a>',
      libId: slot.slotname,
    }))));
  }),
  http.post('https://ads-fail.adhese.com/json', async () => new HttpResponse(undefined, {
    status: 400,
  })),
  http.get('https://ads-test.adhese.com/json/*', async ({ request }) => {
    const urlParts = request.url.split('/');
    const slotNames = urlParts.slice(urlParts.indexOf('json') + 1);

    return new HttpResponse(JSON.stringify(slotNames.map(slotName => ({
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: slotName,
      slotName,
      tag: '<a>foo</a>',
      libId: slotName,
    }))));
  }),
];
