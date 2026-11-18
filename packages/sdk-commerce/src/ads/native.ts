export type NativeData = {
  title: string;
  body?: string;
  image?: string;
  cta?: string;
  url: string;
  advertiser?: string;
};

/**
 * Native schema, version "1": `{ ver: "1", title, url, body?, image?, cta?, advertiser? }`.
 * The same field list defines the creative template in Adhese.
 */
export const nativeSchemaVersion = '1';

const limits = { title: 120, body: 400, cta: 40, advertiser: 80 } as const;

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string')
    return undefined;
  const trimmed = value.trim().slice(0, max);

  return trimmed === '' ? undefined : trimmed;
}

export function httpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string')
    return undefined;
  try {
    const url = new URL(value.trim());

    return url.protocol === 'https:' ? url.href : undefined;
  }
  catch {
    return undefined;
  }
}

/**
 * Validate a native payload. Returns `null` for anything invalid so it is treated as empty and never rendered half-broken.
 * Unknown fields are dropped; URLs must be https.
 */
export function parseNative(tag: unknown): NativeData | null {
  let payload = tag;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    }
    catch {
      return null;
    }
  }

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload))
    return null;

  const raw = payload as Record<string, unknown>;
  const title = text(raw.title, limits.title);
  const url = httpsUrl(raw.url);

  if (raw.ver !== nativeSchemaVersion || !title || !url)
    return null;

  return {
    title,
    url,
    body: text(raw.body, limits.body),
    image: httpsUrl(raw.image),
    cta: text(raw.cta, limits.cta),
    advertiser: text(raw.advertiser, limits.advertiser),
  };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');
}

/**
 * Markup for a native tile. Text is escaped; the link uses the ad's click tracker when it is an https URL.
 */
export function renderNativeTile(data: NativeData, clickUrl?: string, sponsoredLabel = 'Sponsored'): string {
  const href = httpsUrl(clickUrl) ?? data.url;

  return `<a class="adhese-native-tile" href="${escapeHtml(href)}" rel="sponsored noopener">${
    data.image ? `<img class="adhese-native-image" src="${escapeHtml(data.image)}" alt="" loading="lazy">` : ''
  }<span class="adhese-native-text"><span class="adhese-label">${escapeHtml(sponsoredLabel)}${data.advertiser ? ` · ${escapeHtml(data.advertiser)}` : ''}</span>`
  + `<strong class="adhese-native-title">${escapeHtml(data.title)}</strong>${
    data.body ? `<span class="adhese-native-body">${escapeHtml(data.body)}</span>` : ''
  }${data.cta ? `<span class="adhese-native-cta">${escapeHtml(data.cta)}</span>` : ''
  }</span></a>`;
}
