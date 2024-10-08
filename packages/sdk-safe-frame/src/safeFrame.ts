import type { AdheseAd, AdheseContext, AdhesePlugin, AdheseSlot } from '@adhese/sdk';
import type { Config, Position, SafeFrameImplementation } from './safeFrame.types';
import { computed, type ComputedRef, ref, uniqueId, useLogger } from '@adhese/sdk-shared';
import { name, version } from '../package.json';

export type SafeFrame = {
  config: Config;
  addPosition(positions: AdheseAd, element: HTMLElement): Position;
  render(position: Position): Promise<void>;
};

export type SafeFrameOptions = {
  renderFile: string;
  context: AdheseContext;
};

export const safeFramePlugin: AdhesePlugin<{
  name: 'safeFrame';
  /**
   * Slots that are rendered using a safe frame
   */
  slots: ComputedRef<ReadonlyArray<AdheseSlot>>;
}> = (context, plugin) => {
  const logger = useLogger({
    scope: `${name}@${version}`,
  }, {
    context,
    plugin,
  });

  const safeFrame = ref<SafeFrame | null>(null);

  plugin.hooks.onInit(() => {
    safeFrame.value = createSafeFrame({
      renderFile: `${context.options.poolHost}/sf/r.html`,
      context,
    });
  });

  plugin.hooks.onSlotCreate((slot) => {
    if (slot.renderMode !== 'iframe')
      return slot;

    return ({
      ...slot,
      renderMode: 'none',
      type: 'safeFrame',
      setup(slotContext, slotHooks): void {
        slot.setup?.(slotContext, slotHooks);

        slotHooks.onRender(async (data) => {
          if (safeFrame.value && slotContext.value?.element) {
            const position = safeFrame.value.addPosition(data, slotContext.value.element);

            await safeFrame.value.render(position);

            logger.value.debug('Rendered slot using safe frame', slotContext);
          }
        });
      },
    });
  });

  return {
    name: 'safeFrame',
    slots: computed(() => Array.from(context.slots.values()).filter(slot => slot.type === 'safeFrame')),
  };
};

function createSafeFrame({
  renderFile,
  context,
}: SafeFrameOptions): SafeFrame {
  const safeFrame = window.$sf as SafeFrameImplementation | undefined;

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

  return {
    config,
    addPosition,
    render,
  };
}
