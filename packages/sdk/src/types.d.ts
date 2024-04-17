import type { SafeFrameImplementation } from 'safeframe/src/main.types';
import type { Adhese } from './main.types';

type ConsentObject = {
  [key: string]: boolean;
};

type Publisher = {
  consents: ConsentObject;
  legitimateInterests: ConsentObject;
  customPurpose: {
    consents: ConsentObject;
    legitimateInterests: ConsentObject;
  };
  restrictions: Record<string, unknown>;
};

export type ConsentData = {
  tcString: string;
  tcfPolicyVersion: number;
  cmpId: number;
  cmpVersion: number;
  gdprApplies: boolean;
  eventStatus: string;
  cmpStatus: string;
  listenerId: number;
  isServiceSpecific: boolean;
  useNonStandardStacks: boolean;
  // eslint-disable-next-line ts/naming-convention
  publisherCC: string;
  purposeOneTreatment: boolean;
  purpose: {
    consents: ConsentObject;
    legitimateInterests: ConsentObject;
  };
  vendor: {
    consents: ConsentObject;
    legitimateInterests: ConsentObject;
  };
  specialFeatureOptins: ConsentObject;
  customPurposeConsents: ConsentObject;
  customVendorConsents: ConsentObject;
  googleVendorConsents: ConsentObject;
  addtlConsent: string;
  publisher: Publisher;
};

declare global {
  interface Window {
    adhese?: Adhese;
    $sf?: SafeFrameImplementation;
    // eslint-disable-next-line ts/naming-convention
    __tcfapi?(command: 'addEventListener' | 'removeEventListener', version: 2, callback: (data: ConsentData, success: boolean) => void | Promise<void>): void;
  }
}
