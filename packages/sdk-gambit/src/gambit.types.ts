export type Parameters = Record<string, string | ReadonlyArray<string>>;
export type Device = 'desktop' | 'phone' | 'tablet';
export type SlotPayload = {
  format: string;
  slotname?: string;
  parameters?: Parameters;
};
export type GambitSlotData = {
  adRendered?: boolean;
  adRequested?: boolean;
  adReceived?: boolean;
  adData?: any;
  enumerator?: string;
  retryCount?: number;
  slotPayload?: SlotPayload;
  parameters?: Parameters;
  location?: string;
};
export type GambitSlot = {
  slotType: string;
  position?: string;
  containerId: string;
  googleSlot?: string; // If set, used as fallback ad
  devices?: ReadonlyArray<Device>; // Default: all devices
  collapse?: {
    onLoad?: boolean;
    onEmpty?: boolean;
  };
  delayRender?: boolean; // Default: false
  data?: GambitSlotData;
};
export type GambitData = {
  consent: boolean;
  domain: string;
  pageType: string;
  category?: ReadonlyArray<string> | string;
  subCategory?: ReadonlyArray<string> | string;
  productGroup?: ReadonlyArray<string> | string;
  searchTerm?: string;
  userId?: string;
  userMode?: string;
  inOrderMode?: boolean;
  customerType?: string;
  pagePath?: string;
};
export type GambitOptions = {
  debug?: boolean;
  disableAds?: boolean;
  adDisclaimer?: string;
};
export type GambitConfig = {
  slots?: ReadonlyArray<GambitSlot>;
  data?: GambitData;
  options: GambitOptions;
  account: string;
};
