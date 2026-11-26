import { afterEach, describe, expect, it } from 'vitest';
import { configElementId, configGlobalName, readConfig } from './config';

describe('readConfig', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as Record<string, unknown>)[configGlobalName];
  });

  function setGlobal(value: unknown): void {
    (window as unknown as Record<string, unknown>)[configGlobalName] = value;
  }

  function mount(text: string): void {
    document.body.innerHTML = `<script type="application/json" id="${configElementId}">${text}</script>`;
  }

  it('reads a valid config', () => {
    mount('{"mode":"insights","account":"demo","pageType":"home"}');
    expect(readConfig()?.account).toBe('demo');
  });

  it('returns null for missing, malformed or invalid config', () => {
    expect(readConfig()).toBeNull();
    mount('{nope');
    expect(readConfig()).toBeNull();
    mount('{"mode":"insights","account":"demo","pageType":"nope"}');
    expect(readConfig()).toBeNull();
  });

  it('reads the window global when there is no element', () => {
    setGlobal({ mode: 'ads', account: 'tag-manager', pageType: 'product', location: 'ac_product' });
    expect(readConfig()?.account).toBe('tag-manager');
  });

  it('prefers the element over the window global', () => {
    setGlobal({ mode: 'insights', account: 'global', pageType: 'home' });
    mount('{"mode":"insights","account":"element","pageType":"home"}');
    expect(readConfig()?.account).toBe('element');
  });

  it('does not fall back to the global when the element is invalid', () => {
    setGlobal({ mode: 'insights', account: 'global', pageType: 'home' });
    mount('{nope');
    expect(readConfig()).toBeNull();
  });

  it('returns null for an invalid or non-object window global', () => {
    setGlobal({ mode: 'insights', account: '', pageType: 'home' });
    expect(readConfig()).toBeNull();
    setGlobal('{"mode":"insights","account":"demo","pageType":"home"}');
    expect(readConfig()).toBeNull();
  });
});
