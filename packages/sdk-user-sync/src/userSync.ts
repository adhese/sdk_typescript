import type { AdhesePlugin } from '@adhese/sdk';
import { useLogger } from '@adhese/sdk-shared';
import { name, version } from '../package.json';

export type SyncOptions = {
  /**
   * Service handler to sync with. This is provided by Adhese. Make sure to contact Adhese support to have access to this.
   */
  serviceHandler: string;
  /**
   * List of events to sync
   */
  events: ReadonlyArray<string>;
  /**
   * User ID that should be synced
   */
  userId: string;
  /**
   * Expiration time in minutes
   */
  expiration: number;
};

export type UserSyncPlugin = {
  name: 'userSync';
  /**
   * Sync user with Adhese. This will send a request to the Adhese user sync endpoint.
   *
   * @warning This method should only be called when the user has given consent to sync their data. Otherwise, it will
   * throw an error.
   */
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

        const endpoint = new URL(`https://ads-${context.options.account}.adhese.com/usersync/handlers/${serviceHandler}/user_sync`);
        endpoint.searchParams.set('id', events.join(','));
        endpoint.searchParams.set('u', userId);
        endpoint.searchParams.set('ttl', expiration.toString());

        const response = await fetch(endpoint);

        if (!response.ok)
          throw new Error(response.statusText ?? 'Unknown error');

        logger.value.debug('User synced with Adhese', {
          serviceHandler,
          events,
          userId,
          expiration,
        });
      }
      catch (error) {
        logger.value.error(`Failed to sync user. ${(error as Error).message}`);
        throw error;
      }
    },
  };
};
