import type { ConsentData } from '@adhese/sdk/src/types';
import type { Adhese } from '@adhese/sdk';
import type { SafeFrameImplementation } from './main.types';

declare global {
  interface Window {
    adhese?: Adhese;
    $sf?: SafeFrameImplementation;
    // eslint-disable-next-line ts/naming-convention
    __tcfapi?(command: 'addEventListener' | 'removeEventListener', version: 2, callback: (data: ConsentData, success: boolean) => void | Promise<void>): void;
  }
}
