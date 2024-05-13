import type { AdheseAd, AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import type { Ref, UnwrapRef } from '@vue/runtime-core';
import { uniqueId } from '@adhese/sdk-shared';
import { createAsyncHook, createPassiveHook } from '../../hooks/createHook';

export function useSlotHooks({ setup }: AdheseSlotOptions, slotContext: Ref<UnwrapRef<AdheseSlot | null>>): {
  runOnSlotRender: ReturnType<typeof createAsyncHook<AdheseAd>>[0];
  runOnRequest: ReturnType<typeof createAsyncHook<void>>[0];
  runOnDispose: ReturnType<typeof createPassiveHook<void>>[0];
} {
  const id = uniqueId();

  const [runOnSlotRender, onRender, disposeOnRender] = createAsyncHook<AdheseAd>(`onRender:${id}`);
  const [runOnRequest, onRequest, disposeOnRequest] = createAsyncHook(`onRequest:${id}`);
  const [runOnDispose, onDispose, disposeOnDispose] = createPassiveHook(`onDispose:${id}`);

  setup?.(slotContext, {
    onRender,
    onDispose,
    onRequest,
  });

  onDispose(() => {
    disposeOnRender();
    disposeOnRequest();
    disposeOnDispose();
  });

  return { runOnSlotRender, runOnRequest, runOnDispose };
}