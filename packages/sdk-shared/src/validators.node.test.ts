/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { isJsonOrHtmlOptionalString } from './validators';

describe('isJsonOrHtmlOptionalString in node', () => {
  it('parses HTML strings without relying on DOMParser', () => {
    const result = isJsonOrHtmlOptionalString.safeParse('<script src="https://cdn.example.com/ad.js"></script>');

    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data).toBe('<script src="https://cdn.example.com/ad.js"></script>');
  });

  it('still parses JSON strings into objects', () => {
    const result = isJsonOrHtmlOptionalString.safeParse('{"type":"vast","url":"https://example.com/vast"}');

    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data).toEqual({ type: 'vast', url: 'https://example.com/vast' });
  });
});
