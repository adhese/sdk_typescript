import type { AdhesePlugin } from '@adhese/sdk';
import { useLogger } from '@adhese/sdk-shared';
import { name, version } from '../package.json';
import { useDevtoolsUi, useModifiedSlotsHijack, useSlotBadge } from './devtools.composables';

export type { DevtoolsSlotPluginOptions } from './devtools.composables';

export const devtoolsPlugin: AdhesePlugin<{
  name: 'devtools';
}> = (context, plugin) => {
  const logger = useLogger({
    scope: `${name}@${version}`,
  }, { context, plugin });

  useDevtoolsUi(context, plugin.hooks);

  useModifiedSlotsHijack(context, plugin.hooks, logger);

  useSlotBadge(context, plugin.hooks);

  return {
    name: 'devtools',
  };
};
