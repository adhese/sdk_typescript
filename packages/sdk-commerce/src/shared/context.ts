import type { CommerceConfig, PageType, TargetCodes } from './config';

const defaultTargetCodes: TargetCodes = {
  pageType: 'pt',
  category: 'ct',
  searchTerm: 'kw',
  sku: 'sk',
  cartSkus: 'cs',
  customerGroup: 'cg',
  identity: 'mi',
  event: 'ev',
};

/**
 * Page types that carry the category path (the tags of a content page count as its category).
 */
const categoryPageTypes: ReadonlyArray<PageType> = ['category', 'product', 'article', 'landing'];

export function getTargetCodes(config: CommerceConfig): TargetCodes {
  return { ...defaultTargetCodes, ...config.targetCodes };
}

/**
 * Map page context to Adhese targets: category path, search term and SKU, plus the page type.
 */
export function getTargets(config: CommerceConfig): Record<string, ReadonlyArray<string> | string> {
  const codes = getTargetCodes(config);
  const targets: Record<string, ReadonlyArray<string> | string> = { [codes.pageType]: config.pageType };

  const category = config.category && (typeof config.category === 'string' ? [config.category] : config.category);
  if (category && category.length > 0 && categoryPageTypes.includes(config.pageType))
    targets[codes.category] = category;
  if (config.searchTerm && config.pageType === 'search')
    targets[codes.searchTerm] = config.searchTerm;
  if (config.sku && config.pageType === 'product')
    targets[codes.sku] = config.sku;

  return targets;
}
