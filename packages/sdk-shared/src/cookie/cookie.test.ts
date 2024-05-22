import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deleteCookie, getCookie, hasCookie, setCookie } from './cookie';

describe('cookie', () => {
  const cookieMap = new Map<string, string>();

  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get() {
        return Array.from(cookieMap.values()).join('');
      },
      set(value: string) {
        const [key, val] = value.split(/[=;]/u);

        if (val)
          cookieMap.set(key, value);
        else
          cookieMap.delete(key);
      },
    });
  });

  afterEach(() => {
    cookieMap.clear();
  });

  it('should set cookie', () => {
    setCookie({
      key: 'test',
      value: 'value',
    });

    expect(cookieMap.get('test')).toBe('test=value;');

    setCookie({
      key: 'test2',
      value: 'value2',
      expires: `Thu, 01 Jan ${(new Date()).getFullYear() + 1} 00:00:00 UTC`,
    });

    expect(cookieMap.get('test2')).toBe(`test2=value2; expires=Thu, 01 Jan ${(new Date()).getFullYear() + 1} 00:00:00 UTC;`);

    setCookie({
      key: 'test3',
      value: 'value3',
      path: '/',
    });

    expect(cookieMap.get('test3')).toBe('test3=value3; path=/;');

    setCookie({
      key: 'test4',
      value: 'value4',
      samesite: 'strict',
    });

    expect(cookieMap.get('test4')).toBe('test4=value4; samesite=strict;');

    setCookie({
      key: 'test5',
      value: 'value5',
      secure: true,
    });

    expect(cookieMap.get('test5')).toBe('test5=value5; secure=true;');
  });

  it('should delete cookie', () => {
    setCookie({
      key: 'test',
      value: 'value',
    });

    expect(cookieMap.get('test')).toBe('test=value;');

    deleteCookie('test');

    expect(cookieMap.get('test')).toBeUndefined();
  });

  it('should get cookie', () => {
    setCookie({
      key: 'test',
      value: 'value',
    });

    expect(cookieMap.get('test')).toBe('test=value;');

    expect(getCookie('test')).toBe('value');

    deleteCookie('test');

    expect(getCookie('test')).toBeUndefined();
  });

  it('should check if cookie exists', () => {
    setCookie({
      key: 'test',
      value: 'value',
    });

    expect(hasCookie('test')).toBe(true);

    deleteCookie('test');

    expect(hasCookie('test')).toBe(false);
  });
});
