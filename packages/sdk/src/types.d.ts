import type { ConsentData } from 'core/src/types';
import type { Adhese } from './main';

declare global {
  interface Window {
    adhese?: Adhese;
    // eslint-disable-next-line ts/naming-convention
    __tcfapi?(command: 'addEventListener' | 'removeEventListener', version: 2, callback: (data: ConsentData, success: boolean) => void | Promise<void>): void;
  }
}
