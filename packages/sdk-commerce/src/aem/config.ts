import { type CommerceConfig, configElementId, type PageType, pageTypes, parseConfig } from '../shared/config';
import { defaultDataLayerName, readAemPage } from './data-layer';

/**
 * The JSON an AEM page component (or a tag rule) prints in `<script type="application/json" id="adhese-commerce-config">`.
 * Everything the data layer knows is optional here: `pageType` and `category` are derived from it when left out.
 */
export type AemConfig = Omit<CommerceConfig, 'mode' | 'pageType'> & {
  mode?: 'off' | 'insights' | 'ads';
  pageType?: PageType;
  /**
   * Ads: Adhese location per page type, used when `location` is not set, for example `{ "article": "site_article" }`.
   */
  locations?: Partial<Record<PageType, string>>;
  /**
   * Page type per template name (the last segment of `xdm:template`), for example `{ "article-page": "article" }`.
   */
  pageTypes?: Record<string, PageType>;
  /**
   * Name of the data layer object, when it is not `adobeDataLayer`.
   */
  dataLayerName?: string;
  /**
   * Name of the Web SDK instance on the page, when it is not `alloy`.
   */
  alloyName?: string;
};

export type ResolvedAemConfig = CommerceConfig & Pick<AemConfig, 'alloyName'>;

/**
 * Read the page config and complete it from the data layer: the page type from the template (`other` for an unknown
 * template) and the category from the page's tags. The mode is `insights` unless the config says `ads`. Returns `null` when
 * missing, invalid or switched off.
 */
export function readAemConfig(doc: Document = document, win: Window = window): ResolvedAemConfig | null {
  try {
    const text = doc.getElementById(configElementId)?.textContent;
    const raw = text ? (JSON.parse(text) as AemConfig | null) : null;
    if (typeof raw !== 'object' || raw === null || raw.mode === 'off')
      return null;

    const page = readAemPage(win, raw.dataLayerName ?? defaultDataLayerName);
    const mapped = page?.template ? raw.pageTypes?.[page.template] : undefined;
    const pageType = raw.pageType ?? (mapped && pageTypes.includes(mapped) ? mapped : 'other');
    const category = raw.category ?? (page && page.tags.length > 0 ? page.tags : undefined);

    const location = raw.location ?? raw.locations?.[pageType];
    const config = parseConfig({ ...raw, mode: raw.mode ?? 'insights', pageType, category, location });

    return config && { ...config, alloyName: raw.alloyName };
  }
  catch {
    return null;
  }
}
