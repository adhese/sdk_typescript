import { generateName } from '@adhese/sdk-shared';
import { type AdheseAd, parseResponse } from './requestAds/requestAds.schema';
import { parseParameters } from './requestAds/requestAds.utils';

export type FetchAdsSlot = {
  format: string;
  slot?: string;
  parameters?: Record<string, string | ReadonlyArray<string>>;
};

type FetchAdsOptionsBase = {
  /**
   * The account name for the Adhese API
   */
  account: string;
  /**
   * The location/page identifier
   */
  location: string;
  /**
   * Array of slot configurations to fetch ads for
   */
  slots: ReadonlyArray<FetchAdsSlot>;
  /**
   * Request timeout in milliseconds. If the request takes longer than this,
   * an empty array is returned to prevent blocking page load.
   * Set to 0 or undefined for no timeout.
   */
  timeout?: number;
};

type FetchAdsOptionsPost = FetchAdsOptionsBase & {
  /**
   * Use POST request (default). Supports global parameters.
   */
  requestType?: 'POST';
  /**
   * Global parameters to send with the request. Only available with POST.
   */
  parameters?: Record<string, string | ReadonlyArray<string>>;
};

type FetchAdsOptionsGet = FetchAdsOptionsBase & {
  /**
   * Use GET request. More limited - does not support global parameters.
   */
  requestType: 'GET';
};

export type FetchAdsOptions = FetchAdsOptionsPost | FetchAdsOptionsGet;

function toMap<T>(record: Record<string, T>): Map<string, T> {
  return new Map(Object.entries(record));
}

async function fetchWithPost(
  options: FetchAdsOptionsPost,
  signal?: AbortSignal,
): Promise<Response> {
  const host = `https://ads-${options.account}.adhese.com`;

  const payload = {
    slots: options.slots.map(slot => ({
      slotname: generateName(options.location, slot.format, slot.slot),
      parameters: slot.parameters
        ? parseParameters(toMap(slot.parameters))
        : undefined,
    })),
    parameters: options.parameters
      ? parseParameters(toMap(options.parameters))
      : undefined,
  };

  return fetch(`${new URL(host).href}json`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      // eslint-disable-next-line ts/naming-convention
      'content-type': 'application/json',
    },
    signal,
  });
}

async function fetchWithGet(
  options: FetchAdsOptionsGet,
  signal?: AbortSignal,
): Promise<Response> {
  const host = `https://ads-${options.account}.adhese.com`;
  const slotNames = options.slots
    .map(slot => generateName(options.location, slot.format, slot.slot))
    .join('/sl');

  return fetch(`${host}/json/sl${slotNames}`, {
    method: 'GET',
    headers: {
      // eslint-disable-next-line ts/naming-convention
      'content-type': 'application/json',
    },
    signal,
  });
}

/**
 * Fetch ads from the Adhese API. This function can be used on the server (Node.js)
 * to pre-fetch ad data for SSR/hydration.
 *
 * @example
 * ```typescript
 * import { fetchAds } from '@adhese/sdk/server';
 *
 * // In a Next.js Server Component or getServerSideProps
 * const ads = await fetchAds({
 *   account: 'demo',
 *   location: 'homepage',
 *   slots: [{ format: 'leaderboard' }],
 *   timeout: 2000, // Don't block page load for more than 2 seconds
 * });
 *
 * // Use ads[0].width and ads[0].height to reserve space and prevent layout shift
 * ```
 */
export async function fetchAds(
  options: FetchAdsOptions,
): Promise<ReadonlyArray<AdheseAd>> {
  let signal: AbortSignal | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (options.timeout && options.timeout > 0) {
    const controller = new AbortController();
    ({ signal } = controller);
    timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout);
  }

  try {
    const response
      = options.requestType === 'GET'
        ? await fetchWithGet(options, signal)
        : await fetchWithPost(options, signal);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ads: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return parseResponse(data);
  }
  catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return [];
    }
    throw error;
  }
  finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
