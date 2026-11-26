/**
 * The page properties the AEM Core Components put in the Adobe Client Data Layer: `getState().page[<id>]`.
 */
export type AemPage = {
  /**
   * Last segment of `xdm:template`, for example `content-page`.
   */
  template?: string;
  /**
   * `xdm:tags`: AEM tag IDs such as `marketing:interest/sport`.
   */
  tags: ReadonlyArray<string>;
};

export const defaultDataLayerName = 'adobeDataLayer';
const maxTags = 10;

type DataLayer = ReadonlyArray<unknown> & { getState?(): unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * The page item of the data layer. Uses the ACDL computed state when the library is loaded, and falls back to the plain
 * array the Core Components fill when it is not. Returns `null` when the data layer is disabled or has no page yet.
 */
export function readAemPage(win: Window = window, name: string = defaultDataLayerName): AemPage | null {
  try {
    const layer = (win as unknown as Record<string, DataLayer | undefined>)[name];
    if (!layer)
      return null;

    const state = typeof layer.getState === 'function'
      ? layer.getState()
      : Object.assign({}, ...Array.from(layer).filter(isRecord));
    const pages = isRecord(state) && isRecord(state.page) ? Object.values(state.page) : [];
    const page = pages.find(isRecord);
    if (!page)
      return null;

    const template = typeof page['xdm:template'] === 'string' ? page['xdm:template'].split('/').pop() : undefined;
    const tags = Array.isArray(page['xdm:tags'])
      ? page['xdm:tags'].filter((tag): tag is string => typeof tag === 'string' && tag !== '').slice(0, maxTags)
      : [];

    return { template: template || undefined, tags };
  }
  catch {
    return null;
  }
}
