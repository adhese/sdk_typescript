import { uniqueId } from '@adhese/sdk-shared';
import type { AdheseAd, AdheseContext } from '@adhese/sdk';
import type { Config, Position } from './main.types';

export type SafeFrame = {
  config: Config;
  addPosition(positions: AdheseAd, element: HTMLElement): Position;
  render(position: Position): Promise<void>;
  dispose(): void;
};

export type SafeFrameOptions = {
  renderFile: string;
  context: AdheseContext;
};

export function createSafeFrame({
  renderFile,
  context,
}: SafeFrameOptions): SafeFrame {
  const safeFrame = window.$sf;

  if (!safeFrame)
    throw new Error('SafeFrame not found');

  const adhesePositions = new Set<Position>();

  const config = new safeFrame.host.Config({
    auto: false,
    debug: context.debug,
    renderFile,
  });

  function addPosition(ad: AdheseAd, element: HTMLElement): Position {
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
      src: ad.ext === 'js' ? ad.swfSrc?.href : undefined,
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
