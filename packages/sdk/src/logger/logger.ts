import { createLogger } from '@adhese/sdk-shared';
import { name, version } from '../../package.json';

export const logger = createLogger({
  scope: `${name}@${version}`,
});
