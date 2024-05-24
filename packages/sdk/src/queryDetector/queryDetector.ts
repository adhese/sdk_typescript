import { type ComputedRef, computed, debounce, ref } from '@adhese/sdk-shared';
import type { AdheseContext } from '@adhese/sdk';

/**
 * Create a query detector that will match a list of media queries and keeps track of the current matching query
 */
export function useQueryDetector(context: AdheseContext, queries: Record<string, string> = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
}): [ComputedRef<string>, () => void] {
  const entries = Object.entries(queries);

  const active = ref(getQuery(entries));
  const queryList = entries.map(([, query]) => window.matchMedia(query));

  const handleOnChange = debounce((): void => {
    active.value = getQuery(entries);
  }, {
    waitMs: 50,
  });

  context.hooks.onInit(() => {
    for (const query of queryList)
      query.addEventListener('change', handleOnChange.call);

    handleOnChange.call();
  });

  function dispose(): void {
    for (const query of queryList)
      query.removeEventListener('change', handleOnChange.call);
  }

  context.hooks.onDispose(dispose);

  return [computed(() => active.value), dispose];
}

function getQuery(entries: ReadonlyArray<[string, string]>): string {
  for (const [device, query] of entries) {
    if (window.matchMedia(query).matches)
      return device;
  }

  return 'unknown';
}
