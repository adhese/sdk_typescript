import { afterEach, describe, expect, it } from 'vitest';
import { configElementId, readConfig } from './config';

describe('readConfig', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

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
});
