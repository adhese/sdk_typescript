import type { Ad } from '@core';
import { uniqueId } from 'lodash-es';
import type { Config, Position, SafeFrameImplementation } from './main.types';

export type SafeFrame = {
  config: Config;
  addPosition(positions: Ad, element: HTMLElement): Position;
  render(position: Position): Promise<void>;
  dispose(): void;
};

export type SafeFrameOptions = {
  renderFile: string;
};

export async function createSafeFrame({
  renderFile,
}: SafeFrameOptions): Promise<SafeFrame> {
  // @ts-expect-error - TS doesn't know about this module
  await import('../vendor/sf');

  const safeFrame = window.$sf as SafeFrameImplementation | undefined;

  if (!safeFrame)
    throw new Error('SafeFrame not found');

  const adhesePositions = new Set<Position>();

  const config = new safeFrame.host.Config({
    auto: false,
    debug: true,
    renderFile,
  });

  function addPosition(ad: Ad, element: HTMLElement): Position {
    if (!safeFrame)
      throw new Error('SafeFrame not found');

    const html = (ad.ext === 'js' && ad.body) ? ad.body : ad.tag;

    if (typeof html !== 'string')
      throw new Error('Ad tag is not a string');

    const elementId = element.id || `ad-${ad.id}-${uniqueId()}`;

    element.id = elementId;

    const position = new safeFrame.host.Position({
      id: elementId,
      html,
      src: ad.swfSrc?.href,
      config: new safeFrame.host.PosConfig({
        id: elementId,
        w: Number(ad.width),
        h: Number(ad.height),
        size: `${Number(ad.width)}x${Number(ad.height)}`,
        tgt: html.includes('target="_self"') ? '_self' : '_blank',
        dest: elementId,
      }),
    });

    adhesePositions.add(position);

    return position;
  }

  async function render(position: Position): Promise<void> {
    if (!safeFrame)
      throw new Error('SafeFrame not found');

    safeFrame.host.render(position);
  }

  function dispose(): void {
  }

  return {
    config,
    addPosition,
    render,
    dispose,
  };
}
