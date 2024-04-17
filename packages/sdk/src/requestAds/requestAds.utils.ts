import { toValue } from '@vue/runtime-core';
import { type AdRequestOptions, logger } from '@adhese/sdk';

type AdPostPayload = {
  slots: ReadonlyArray<{
    slotname: string;
    parameters?: Record<string, ReadonlyArray<string> | string>;
  }>;
  parameters?: Record<string, ReadonlyArray<string> | string>;
};

export function requestWithPost({
  context: { options: { host }, parameters },
  ...options
}: Omit<AdRequestOptions, 'method'>): Promise<Response> {
  const payload = {
    ...options,
    slots: options.slots.map(slot => ({
      slotname: toValue(slot.name),
      parameters: parseParameters(slot.parameters),
    })),
    parameters: parameters && parseParameters(parameters),
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

export async function requestWithGet({ context, slots }: Omit<AdRequestOptions, 'method'>): Promise<Response> {
  return fetch(new URL(`${context.options.host}/json/sl${slots.map(slot => toValue(slot.name)).join('/sl')}`), {
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
  }).map(([key, value]): [string, T] => {
    if (typeof value === 'string')
      return [key, filterSpecialChars(value) as T];

    return [key, value.map(filterSpecialChars) as unknown as T];
  }));
}

function filterSpecialChars(value: string): string {
  const specialRegex = /[^\p{L}\p{N}_]/gu;

  return value.replaceAll(specialRegex, '_');
}
