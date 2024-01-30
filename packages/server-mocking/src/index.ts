import { setupServer } from 'msw/node';
import { adRequestHandlers } from './mocks/adRequest';
import { adPreviewRequestHandlers } from './mocks/adPreviewRequest';

export const mockServer = setupServer(...adRequestHandlers, ...adPreviewRequestHandlers);
