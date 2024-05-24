import type { AdhesePlugin } from '@adhese/sdk';
import { generateName, useLogger } from '@adhese/sdk-shared';
import { name as packageName, version } from '../package.json';

export type VastCreateUrlOptions = {
  /**
   * The format of the VAST request
   */
  format: string;
  /**
   * Extra custom parameters to add to the URL
   */
  parameters?: Record<string, string>;
  /**
   * The host to use for the URL
   *
   * @default context.options.host
   */
  host?: string;
};

export type VastUrlPlugin = {
  name: 'vastUrl';
  /**
   * Create a URL for a VAST ad request. The URL will use the current location, global Adhese parameters and the given
   * format and custom parameters.
   * @param options
   */
  createUrl(options: VastCreateUrlOptions): URL;
};

export const vastUrlPlugin: AdhesePlugin<VastUrlPlugin> = (context, plugin) => {
  const logger = useLogger({
    scope: `${packageName}@${version}`,
  }, { context, plugin });

  function createUrl({
    format,
    parameters = {},
    host = context.options.host,
  }: VastCreateUrlOptions): URL {
    const name = generateName(context.location, format);

    const parametersString = [...context.parameters.entries(), ...Object.entries(parameters)].map(([key, value]) => `${key}${value.toString()}`).join('/');

    const url = new URL(`${host}/ad/sl${name}/${parametersString}`);

    logger.value.debug('Created URL', url.href);

    return url;
  }

  return ({
    name: 'vastUrl',
    createUrl,
  });
};
