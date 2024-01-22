import type { Adhese } from '@core';

declare global {
  interface Window {
    adhese?: Adhese;
  }

  let adhese: Adhese | undefined;
}
