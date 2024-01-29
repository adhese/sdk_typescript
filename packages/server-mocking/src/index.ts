import { setupServer } from 'msw/node';
import { adRequestHandlers } from './mocks/adRequest';

export const mockServer = setupServer(...adRequestHandlers);
