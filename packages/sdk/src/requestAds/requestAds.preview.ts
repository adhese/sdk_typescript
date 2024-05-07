import { logger } from '../logger/logger';
import type { Ad } from './requestAds.schema';

export async function requestPreviews(account: string): Promise<ReadonlyArray<Ad>> {
  const previewObjects = getPreviewObjects();

  const [list, adSchema] = await Promise.all([
    Promise.allSettled(previewObjects
      .filter(previewObject => 'adhesePreviewCreativeId' in previewObject)
      .map(async (previewObject) => {
        const endpoint = new URL(`https://${account}-preview.adhese.org/creatives/preview/json/tag.do`);
        endpoint.searchParams.set(
          'id',
          previewObject.adhesePreviewCreativeId,
        );

        const response = await fetch(endpoint.href, {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        });

        if (!response.ok)
          return Promise.reject(new Error(`Failed to request preview ad with ID: ${previewObject.adhesePreviewCreativeId}`));

        return await response.json() as unknown;
      })),
    import('./requestAds.schema').then(module => module.adSchema),
  ]);

  return adSchema.array().parse(list
    .filter((response): response is PromiseFulfilledResult<ReadonlyArray<Record<string, unknown>>> => {
      if (response.status === 'rejected') {
        logger.error(response.reason as string);
        return false;
      }
      return response.status === 'fulfilled';
    })
    .flatMap(response => response.value.map(item => ({
      ...item,
      preview: true,
    })))) as ReadonlyArray<Ad>;
}

function getPreviewObjects(): ReadonlyArray<Record<string, string>> {
  const currentUrl = new URL(window.location.href);

  const previewObjects: Array<Record<string, string>> = [];
  let currentObject: Record<string, string> = {};

  for (const [key, value] of currentUrl.searchParams.entries()) {
    if (key === 'adhesePreviewCreativeId' && Object.keys(currentObject).length > 0) {
      previewObjects.push(currentObject);
      currentObject = {};
    }

    currentObject[key] = value;
  }

  if (Object.keys(currentObject).length > 0)
    previewObjects.push(currentObject);

  return previewObjects;
}
