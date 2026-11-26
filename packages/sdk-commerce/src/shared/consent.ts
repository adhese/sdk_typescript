type TcfData = { tcString?: string; eventStatus?: string };
type TcfApi = (command: string, version: number, callback: (data: TcfData, success: boolean) => void) => void;

export type Consent = {
  granted: boolean;
  /**
   * `xt` for a TCF string, `tl` for a binary yes/no, as in `@adhese/sdk`.
   */
  params: Record<string, string>;
};

const tcfName = '__tcfapi';
const denied: Consent = { granted: false, params: {} };
/**
 * A TCF consent string is base64url segments joined by dots. Anything else is not forwarded.
 */
const tcStringPattern = /^[\w.-]{1,2000}$/;

/**
 * TCF v2 via `__tcfapi` when a CMP is present, otherwise the consent string a tag manager hands over in
 * `window.adheseTcString` (for sites whose CMP only writes the string to the data layer), otherwise the CMP's yes/no
 * flag `window.adheseConsent`. No measurement consent means no request, so the absence of any signal is a denial.
 */
export async function getConsent(win: Window = window): Promise<Consent> {
  const flags = win as unknown as { [tcfName]?: TcfApi; adheseConsent?: boolean; adheseTcString?: unknown };
  const tcf = flags[tcfName];

  if (typeof tcf === 'function') {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(denied);
      }, 3000);
      tcf('getTCData', 2, (data, success) => {
        if (!success || !data.tcString)
          return;
        clearTimeout(timeout);
        resolve({ granted: true, params: { xt: data.tcString } });
      });
    });
  }

  if (typeof flags.adheseTcString === 'string' && tcStringPattern.test(flags.adheseTcString))
    return { granted: true, params: { xt: flags.adheseTcString } };

  if (flags.adheseConsent === true)
    return { granted: true, params: { tl: 'all' } };

  return denied;
}
