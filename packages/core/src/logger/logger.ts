import pino from 'pino';

export const logger = pino().child({
  name: 'Adhese SDK',
});
