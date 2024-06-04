import type { AdheseLite } from '@adhese/sdk-lite';

declare global {
  interface Window {
    adhese?: AdheseLite;
  }
}
