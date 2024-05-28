import type { AdhesePlugin } from '@adhese/sdk';
import { useLogger } from '@adhese/sdk-shared';
import { name, version } from '../package.json';

export type SyncOptions = {
  serviceHandler: string;
  events: ReadonlyArray<string>;
  userId: string;
  expiration: number;
};

export type UserSyncPlugin = {
  name: 'userSync';
  sync(options: SyncOptions): Promise<void>;
};

export const userSyncPlugin: AdhesePlugin<UserSyncPlugin> = (context, plugin) => {
  const logger = useLogger({
    scope: `${name}@${version}`,
  }, { context, plugin });

  return {
    name: 'userSync',
    async sync({
      serviceHandler,
      events,
      userId,
      expiration,
    }: SyncOptions): Promise<void> {
      try {
        if (context.consentString === 'none')
          throw new Error('No consent provided');

        const endpoint = new URL(`https://ads-${context.options.account}.adhese.com/usersync/${serviceHandler}/user_sync`);
        endpoint.searchParams.set('id', events.join(','));
        endpoint.searchParams.set('u', userId);
        endpoint.searchParams.set('ttl', expiration.toString());

        logger.value.debug('Syncing user', endpoint.href);

        const [response, { userSyncSchema, userSyncErrorSchema }] = await Promise.all([fetch(endpoint.toString()), import('./userSync.schema')]);

        const data = await response.json() as unknown;

        const errorData = userSyncErrorSchema.safeParse(data);

        if (errorData.success)
          throw new Error(errorData.error);

        const parsedData = userSyncSchema.safeParse(data);
        if (!parsedData.success)
          throw new Error(parsedData.error.toString());

        logger.value.debug('User synced', parsedData.data);
      }
      catch (error) {
        logger.value.error(`Failed to sync user; ${(error as Error).message}`);
        throw error;
      }
    },
  };
};
