/* v8 ignore start */
export type { Merge } from './types/Merge';
export type { UrlString } from './types/UrlString';
export { isUrlString } from './isUrlString/isUrlString';
export { waitForDomLoad } from './waitForDomLoad/waitForDomLoad';
export { awaitTimeout } from './awaitTimeout/awaitTimeout';
export type { EventManager } from './eventManager/eventManager';
export { createEventManager } from './eventManager/eventManager';
export { uniqueId } from './uniqueId/uniqueId';
export { setCookie, getCookie, hasCookie, deleteCookie, type CookieOptions } from './cookie/cookie';
export type { Logger, Log, LogFunction, LoggerOptions } from './createLogger/createLogger';
export { createLogger, useLogger } from './createLogger/createLogger';
export { createAsyncHook } from './hooks/asyncHook';
export { createSyncHook } from './hooks/syncHook';
export { createPassiveHook } from './hooks/passiveHooks';
export { addTrackingPixel } from './addTrackingPixel/addTrackingPixel';
export { generateName } from './generateName/generateName';

export type { ComputedRef, Ref, UnwrapRef, UnwrapNestedRefs, ShallowReactive, ShallowRef, ShallowUnwrapRef, MaybeRef, WritableComputedRef, WritableComputedOptions, ComputedGetter, ComputedSetter, ComputedOptions } from '@vue/runtime-core';
export { watch, watchEffect, effectScope, reactive, ref, toValue, toRefs, toRaw, computed, isProxy, isRef, isReactive, isReadonly, readonly, markRaw, shallowReactive, shallowReadonly, shallowRef, unref, customRef, isShallow, watchPostEffect, watchSyncEffect } from '@vue/runtime-core';
