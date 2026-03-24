/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { isHtmlString, isJson, isJsonOrHtmlString } from './validators';

const scriptTag = '<script type="text/javascript" data-adhese="elektronik;tv__foto_og_lyd;tv;49_50_" data-api="ZeitEngine.js" data-clicktracker="" charset="UTF-8" data-analyticsid="v3mi_hstd" src="https://cdn.zeitcloud.io/prod/wdxo/htzp/oo1n/v3mi/main.js"></script>';

describe('validators with script tag', () => {
  it('isJson should fail for script tag', () => {
    const result = isJson.safeParse(scriptTag);
    expect(result.success).toBe(false);
  });

  it('isHtmlString should pass for script tag', () => {
    const result = isHtmlString.safeParse(scriptTag);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(scriptTag);
    }
  });

  it('isJsonOrHtmlString should pass for script tag', () => {
    const result = isJsonOrHtmlString.safeParse(scriptTag);
    expect(result.success).toBe(true);
  });

  it('isHtmlString should still reject plain text', () => {
    const result = isHtmlString.safeParse('hello world');
    expect(result.success).toBe(false);
  });

  it('isHtmlString should still reject empty string', () => {
    const result = isHtmlString.safeParse('');
    expect(result.success).toBe(false);
  });

  it('isHtmlString should pass for regular HTML', () => {
    const result = isHtmlString.safeParse('<div>hello</div>');
    expect(result.success).toBe(true);
  });
});
