import { random } from 'lodash-es';
import { logger } from './logger/logger';
import type { QueryDetector } from './queryDetector/queryDetector';

import type { AdheseContext, AdheseOptions } from './main.types';

export function createParameters(
  options: Pick<AdheseOptions, 'parameters' | 'consent' | 'logUrl' | 'logReferrer'>,
  queryDetector: QueryDetector,
): MapWithEvents<string, string | ReadonlyArray<string>> {
  const parameters = new MapWithEvents<string, string | ReadonlyArray<string>>();

  if (options.logReferrer)
    parameters.set('re', btoa(document.referrer));

  if (options.logUrl)
    parameters.set('ur', btoa(window.location.href));

  for (const [key, value] of Object.entries({
    ...options.parameters ?? {},
    tl: options.consent ? 'all' : 'none',
    dt: queryDetector.getQuery(),
    br: queryDetector.getQuery(),
    rn: random(10_000).toString(),
  }))
    parameters.set(key, value);

  return parameters;
}

export function setupLogging(mergedOptions: AdheseContext['options']): void {
  if (mergedOptions.debug || window.location.search.includes('adhese_debug=true')) {
    logger.setMinLogLevelThreshold('debug');
    logger.debug('Debug logging enabled');
  }

  logger.debug('Created Adhese SDK instance', {
    mergedOptions,
  });
}

export function isPreviewMode(): boolean {
  return window.location.search.includes('adhesePreviewCreativeId');
}

export class MapWithEvents<T, U> extends Map<T, U> {
  private readonly listeners = new Set<() => void>();

  public addEventListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  public removeEventListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  public set(key: T, value: U): this {
    const set = super.set(key, value);

    this.listeners.forEach((listener) => {
      listener();
    });

    return set;
  }

  public clear(): void {
    super.clear();

    this.listeners.forEach((listener) => {
      listener();
    });
  }

  public delete(key: T): boolean {
    const deleted = super.delete(key);

    this.listeners.forEach((listener) => {
      listener();
    });

    return deleted;
  }

  /**
   * Remove all listeners and clear the map.
   */
  public dispose(): void {
    this.listeners.clear();
    super.clear();
  }
}
