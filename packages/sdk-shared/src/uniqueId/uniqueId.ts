export const urlAlphabet
  = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

export function uniqueId(size: number = 21): string {
  let currentSize = size;

  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  while (currentSize--)
    id += urlAlphabet[bytes[currentSize] & 63];

  return id;
}
