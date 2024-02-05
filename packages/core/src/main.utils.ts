import { random } from 'lodash-es';
import type { DeviceDetector } from './deviceDetector/deviceDetector';
import { logger } from './logger/logger';
import type { AdheseOptions } from './main';

export function createParameters(
  options: Pick<AdheseOptions, 'parameters' | 'consent' | 'logUrl' | 'logReferrer'>,
  deviceDetector: DeviceDetector,
): Map<string, string | ReadonlyArray<string>> {
  const parameters = new Map<string, string | ReadonlyArray<string>>();

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

export function setupLogging(mergedOptions: AdheseOptions): void {
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
