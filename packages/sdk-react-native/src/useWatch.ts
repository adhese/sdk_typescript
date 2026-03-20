import type { WatchHandle, WatchOptions } from '@adhese/sdk-shared/core';
import { watch } from '@adhese/sdk-shared/core';
import {
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Hook that will observe a value on a reactive object and convert to React state.
 * Bridges Vue reactivity (from sdk-shared) to React's useState.
 */
export function useWatch<
  Input,
  Output = Input extends () => unknown ? ReturnType<Input> | undefined : Input | undefined,
>(value?: Input, options?: Omit<WatchOptions, 'immediate'>): Output {
  const [state, setState] = useState<Output>(typeof value === 'function' ? value() : value);

  useIsomorphicLayoutEffect(() => {
    let handle: WatchHandle | undefined;

    if (value) {
      handle = watch(value, (newValue) => {
        setState(newValue as Output);
      }, { immediate: true, ...options });
    }

    return (): void => {
      handle?.stop();
    };
  }, [value]);

  return state;
}
