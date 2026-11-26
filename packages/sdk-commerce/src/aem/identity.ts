/* eslint-disable ts/naming-convention */
import { isIdentity } from '../shared/identity';

type Alloy = (command: string, options?: unknown) => Promise<{ identity?: { ECID?: unknown } } | undefined>;

/**
 * The visitor's ECID from the Web SDK, or `undefined` when the SDK is missing, answers too late or fails. Only call this
 * once consent is granted: the Web SDK may set its identity cookie when asked.
 */
export async function getEcid(win: Window = window, name?: string, timeoutMs = 1000): Promise<string | undefined> {
  const { __alloyNS: names } = win as unknown as { __alloyNS?: ReadonlyArray<string> };
  const alloy = (win as unknown as Record<string, Alloy | undefined>)[name ?? names?.[0] ?? 'alloy'];
  if (typeof alloy !== 'function')
    return undefined;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      alloy('getIdentity', { namespaces: ['ECID'] }),
      new Promise<undefined>((resolve) => {
        timer = setTimeout(resolve, timeoutMs) as unknown as ReturnType<typeof setTimeout>;
      }),
    ]);
    const ecid = result?.identity?.ECID;

    return isIdentity(ecid) ? ecid : undefined;
  }
  catch {
    return undefined;
  }
  finally {
    clearTimeout(timer);
  }
}
