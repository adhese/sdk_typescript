import { setupServer } from 'msw/node';
import { adPreviewRequestHandlers } from './mocks/adPreviewRequest';
import { adRequestHandlers } from './mocks/adRequest';

export const mockServer = setupServer(...adRequestHandlers, ...adPreviewRequestHandlers);
