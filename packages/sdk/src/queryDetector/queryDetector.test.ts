import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
// eslint-disable-next-line ts/naming-convention
import MatchMediaMock from 'vitest-matchmedia-mock';
import { testContext } from '../testUtils';
import { useQueryDetector } from './queryDetector';

describe('queryDetector', () => {
  const mediaQueryMock = new MatchMediaMock();

  beforeEach(() => {
    mediaQueryMock.useMediaQuery('(min-width: 1280px) and (pointer: fine)');
  });

  afterEach(() => {
    mediaQueryMock.clear();
  });

  afterAll(() => {
    mediaQueryMock.destroy();
  });

  it('should create a queryDetector', async () => {
    mediaQueryMock.useMediaQuery('(max-width: 768px)');

    const [device, dispose] = useQueryDetector(testContext);

    expect(device.value).toBe('phone');

    dispose();
  });

  it('should return unknown device', () => {
    // validQuery = '(min-width: 1280px) and (pointer: fine)';
    mediaQueryMock.useMediaQuery('(min-width: 1280px) and (pointer: fine)');

    const [device, dispose] = useQueryDetector(testContext);

    expect(device.value).toBe('unknown');

    dispose();
  });

  it('should create a queryDetector with custom queries', () => {
    const [device, dispose] = useQueryDetector(testContext, {
      phone: '(max-width: 768px) and (pointer: coarse)',
      tablet: '(min-width: 769px) and (max-width: 1024px) and (pointer: coarse)',
      desktop: '(min-width: 1025px) and (pointer: fine)',
      largeDesktop: '(min-width: 1280px) and (pointer: fine)',
    });

    expect(device.value).toBe('largeDesktop');

    dispose();
  });
});
