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
export { createLogger } from './createLogger/createLogger';

export type { ComputedRef, Ref, UnwrapRef, UnwrapNestedRefs, ShallowReactive, ShallowRef, ShallowUnwrapRef, MaybeRef } from '@vue/runtime-core';
export { watch, watchEffect, effectScope, reactive, ref, toValue, toRefs, toRaw, computed, isProxy, isRef, isReactive, isReadonly, readonly, markRaw, shallowReactive, shallowReadonly, shallowRef, unref, customRef, isShallow, watchPostEffect, watchSyncEffect } from '@vue/runtime-core';
