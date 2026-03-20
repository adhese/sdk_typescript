import type { AdheseContext } from '@adhese/sdk/core';
import { ref, watch } from '@adhese/sdk-shared/core';

/**
 * Simple consent handler for React Native.
 * Supports binary consent (true/false) or a TCF consent string passed via options.
 * Does not listen to window.__tcfapi (not available in RN).
 */
export function useConsent(context: AdheseContext): void {
  const consent = ref<string>('none');

  watch(() => context.consent, (newConsent) => {
    consent.value = newConsent ? 'all' : 'none';
  }, { immediate: true });

  watch(consent, (newConsent) => {
    const isTcf = newConsent !== 'none' && newConsent !== 'all';

    if (isTcf) {
      context.parameters.set('xt', newConsent);
      context.parameters.delete('tl');
    }
    else {
      context.parameters.set('tl', newConsent);
      context.parameters.delete('xt');
    }

    context.consentString = newConsent;
  }, { immediate: true });
}
