import type { PropsWithChildren, ReactElement, RefObject } from 'react';

declare function AdheseProvider({ children, options }: PropsWithChildren<{
  options: any;
}>): ReactElement;

declare function useAdhese(): any | undefined;

declare function useAdheseSlot(elementRef: RefObject<HTMLElement>, options: any): any;

declare function AdheseSlot({ onChange, ...options }: {
  onChange?(slot: any | null): void;
} & any): ReactElement;
