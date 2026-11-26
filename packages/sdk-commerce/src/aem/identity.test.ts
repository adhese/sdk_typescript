/* eslint-disable ts/naming-convention */
import { describe, expect, it, vi } from 'vitest';
import { getEcid } from './identity';

const ecid = '14575006536349286404619648085736425115';

function withAlloy(alloy: unknown, name = 'alloy'): Window {
  return { [name]: alloy } as unknown as Window;
}

describe('getEcid', () => {
  it('asks the Web SDK for the ECID namespace', async () => {
    const alloy = vi.fn().mockResolvedValue({ identity: { ECID: ecid } });
    expect(await getEcid(withAlloy(alloy))).toBe(ecid);
    expect(alloy).toHaveBeenCalledWith('getIdentity', { namespaces: ['ECID'] });
  });

  it('finds a renamed instance through the configured name or __alloyNS', async () => {
    const alloy = vi.fn().mockResolvedValue({ identity: { ECID: ecid } });
    expect(await getEcid(withAlloy(alloy, 'myAlloy'), 'myAlloy')).toBe(ecid);
    expect(await getEcid({ __alloyNS: ['other'], other: alloy } as unknown as Window)).toBe(ecid);
  });

  it('is undefined without the Web SDK, on failure, on a late answer or on a malformed value', async () => {
    expect(await getEcid(withAlloy(undefined))).toBeUndefined();
    expect(await getEcid(withAlloy(vi.fn().mockRejectedValue(new Error('no consent'))))).toBeUndefined();
    expect(await getEcid(withAlloy(vi.fn().mockReturnValue(new Promise(() => {}))), undefined, 10)).toBeUndefined();
    expect(await getEcid(withAlloy(vi.fn().mockResolvedValue({ identity: { ECID: 'a@b.com' } })))).toBeUndefined();
  });
});
