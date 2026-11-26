/* eslint-disable ts/naming-convention -- `__tcfapi` is the name the TCF standard gives the CMP function. */
import { describe, expect, it } from 'vitest';
import { getConsent } from './consent';

type Flags = { __tcfapi?: unknown; adheseConsent?: boolean; adheseTcString?: unknown };

function windowWith(flags: Flags): Window {
  return flags as unknown as Window;
}

describe('getConsent', () => {
  it('denies without any signal', async () => {
    expect(await getConsent(windowWith({}))).toEqual({ granted: false, params: {} });
  });

  it('sends the yes/no flag as tl', async () => {
    expect(await getConsent(windowWith({ adheseConsent: true }))).toEqual({ granted: true, params: { tl: 'all' } });
    expect((await getConsent(windowWith({ adheseConsent: false }))).granted).toBe(false);
  });

  it('reads the string of a CMP through __tcfapi', async () => {
    const __tcfapi = (_command: string, _version: number, callback: (data: { tcString: string }, success: boolean) => void): void => {
      callback({ tcString: 'CPabc' }, true);
    };

    expect(await getConsent(windowWith({ __tcfapi }))).toEqual({ granted: true, params: { xt: 'CPabc' } });
  });

  it('falls back to the string a tag manager provides when there is no __tcfapi', async () => {
    expect(await getConsent(windowWith({ adheseTcString: 'CPabc.def-_' }))).toEqual({ granted: true, params: { xt: 'CPabc.def-_' } });
  });

  it('prefers the string over the yes/no flag', async () => {
    expect((await getConsent(windowWith({ adheseTcString: 'CPabc', adheseConsent: true }))).params).toEqual({ xt: 'CPabc' });
  });

  it('ignores a string that is not a TCF string', async () => {
    expect((await getConsent(windowWith({ adheseTcString: 'a b&c=d' }))).granted).toBe(false);
    expect((await getConsent(windowWith({ adheseTcString: '' }))).granted).toBe(false);
    expect((await getConsent(windowWith({ adheseTcString: 'x'.repeat(2001) }))).granted).toBe(false);
    expect((await getConsent(windowWith({ adheseTcString: 42 }))).granted).toBe(false);
  });
});
