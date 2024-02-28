import { random } from 'lodash-es';
import type { DeviceDetector } from './deviceDetector/deviceDetector';
import { logger } from './logger/logger';
import type { AdheseContext, AdheseOptions } from './main';

export function createParameters(
  options: Pick<AdheseOptions, 'parameters' | 'consent' | 'logUrl' | 'logReferrer'>,
  deviceDetector: DeviceDetector,
): MapWithEvents<string, string | ReadonlyArray<string>> {
  const parameters = new MapWithEvents<string, string | ReadonlyArray<string>>();

  if (options.logReferrer)
    parameters.set('re', btoa(document.referrer));

  if (options.logUrl)
    parameters.set('ur', btoa(window.location.href));

  for (const [key, value] of Object.entries({
    ...options.parameters ?? {},
    tl: options.consent ? 'all' : 'none',
    dt: deviceDetector.getDevice(),
    br: deviceDetector.getDevice(),
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

export function createPreviewUi(): void {
  if (window.location.search.includes('adhesePreviewCreativeId')) {
    logger.warn('Adhese preview mode enabled');

    const disableButton = document.createElement('button');
    disableButton.textContent = 'Disable Adhese preview mode. Click to close';
    disableButton.style.position = 'fixed';
    disableButton.style.insetBlockStart = '10px';
    disableButton.style.insetInlineEnd = '10px';
    disableButton.style.zIndex = '9999';
    disableButton.style.padding = '10px';
    disableButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    disableButton.style.color = 'white';
    disableButton.style.fontFamily = 'sans-serif';
    disableButton.style.border = 'none';
    disableButton.style.cursor = 'pointer';
    disableButton.style.maxInlineSize = '120px';
    disableButton.type = 'button';

    disableButton.addEventListener('click', () => {
      const currentUrl = new URL(window.location.href);

      window.location.replace(`${currentUrl.origin}${currentUrl.pathname === '/' ? '' : currentUrl.pathname}`);
    });

    document.body.appendChild(disableButton);
  }
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
