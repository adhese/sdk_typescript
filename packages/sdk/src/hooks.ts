import { createAsyncHook, createSyncHook } from '@adhese/sdk-shared';
import type { AdMultiRequestOptions } from './requestAds/requestAds';
import type { AdheseAd, AdheseSlotOptions } from './index';

// eslint-disable-next-line ts/explicit-function-return-type,ts/explicit-module-boundary-types
export function createGlobalHooks() {
  const disposeFunctions = new Set<() => void>();

  let isInit = false;
  const [runOnInit, onInit, disposeOnInit] = createSyncHook({
    onRun(callbacks) {
      isInit = true;
      callbacks?.clear();
    },
    onAdd() {
      if (isInit)
        runOnInit();
    },
  });
  disposeFunctions.add(disposeOnInit);

  let isDisposed = false;
  const [runOnDispose, onDispose, disposeOnDispose] = createSyncHook({
    onRun(callbacks) {
      isDisposed = true;
      callbacks?.clear();
    },
    onAdd() {
      if (isDisposed)
        runOnDispose();
    },
  });
  disposeFunctions.add(disposeOnDispose);

  const [runOnRequest, onRequest, disposeOnRequest] = createAsyncHook<AdMultiRequestOptions>();
  disposeFunctions.add(disposeOnRequest);

  const [runOnResponse, onResponse, disposeOnResponse] = createAsyncHook<ReadonlyArray<AdheseAd>>();
  disposeFunctions.add(disposeOnResponse);

  const [runOnSlotCreate, onSlotCreate, disposeOnSlotCreate] = createSyncHook<AdheseSlotOptions>();
  disposeFunctions.add(disposeOnSlotCreate);

  function clearAll(): void {
    for (const disposeFunction of disposeFunctions)
      disposeFunction();
  }

  return {
    runOnInit,
    onInit,
    runOnDispose,
    onDispose,
    runOnRequest,
    onRequest,
    runOnResponse,
    onResponse,
    runOnSlotCreate,
    onSlotCreate,
    clearAll,
  };
}
