import { type AdRequestOptions, logger } from '@core';

type AdPostPayload = {
  slots: ReadonlyArray<{
    slotname: string;
    parameters?: Record<string, ReadonlyArray<string> | string>;
  }>;
  parameters?: Record<string, ReadonlyArray<string> | string>;
};

export function requestWithPost({
  host,
  ...options
}: Omit<AdRequestOptions, 'method' | 'context'>): Promise<Response> {
  const payload = {
    ...options,
    slots: options.slots.map(slot => ({
      slotname: slot.getName(),
      parameters: parseParameters(slot.parameters),
    })),
    parameters: options.parameters && parseParameters(options.parameters),
  } satisfies AdPostPayload;

  return fetch(`${new URL(host).href}json`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      // eslint-disable-next-line ts/naming-convention
      'Content-Type': 'application/json',
    },
  });
}

export async function requestWithGet(options: Omit<AdRequestOptions, 'method' | 'context'>): Promise<Response> {
  return fetch(new URL(`${options.host}/json/sl${options.slots.map(slot => slot.getName()).join('/sl')}`), {
    method: 'GET',
    headers: {
      // eslint-disable-next-line ts/naming-convention
      'Content-Type': 'application/json',
    },
  });
}

export function parseParameters<T extends string | ReadonlyArray<string>>(parameters: Map<string, T>): Record<string, T> {
  return Object.fromEntries(Array.from(parameters.entries()).filter(([key]) => {
    if (key.length === 2)
      return true;

    logger.warn(`Invalid parameter key: ${key}. Key should be exactly 2 characters long. Key will be ignored.`);
    return false;
  }));
}
