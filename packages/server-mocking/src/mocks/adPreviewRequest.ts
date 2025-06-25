import { http, HttpResponse } from 'msw';

export const adPreviewRequestHandlers = [
  http.get(`https://test-preview.adhese.org/creatives/preview/json/tag.do`, ({ request }) => {
    const id = new URL(request.url).searchParams.get('id');

    if (id === 'fail') {
      return new HttpResponse(undefined, {
        status: 400,
      });
    }

    return new HttpResponse(JSON.stringify([{
      adFormat: 'foo',
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'foo',
      slotName: 'foo-bar',
      tag: '<a>preview</a>',
      libId: 'foo-bar',
      origin: 'JERLICIA',
      id: 'foo-bar',
    }]));
  }),
];
