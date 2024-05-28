import { type ComputedRef, type Ref, computed, ref, watch } from '@adhese/sdk-shared';
import type { AdheseContext } from '@adhese/sdk';
import type { ConsentData } from '../types';

export function useConsent(context: AdheseContext): [
  value: Ref<string>,
  type: ComputedRef<'binary' | 'tcf'>,
] {
  const consent = ref('none');
  const consentType = computed(() => (consent.value === 'none' || consent.value === 'all') ? 'binary' : 'tcf');

  function onTcfConsentChange(data: ConsentData): void {
    if (data.tcString)
      consent.value = data.tcString;
  }

  context.hooks.onInit(() => {
    window.__tcfapi?.('addEventListener', 2, onTcfConsentChange);
  });

  context.hooks.onDispose(() => {
    window.__tcfapi?.('removeEventListener', 2, onTcfConsentChange);
  });

  watch(() => context.consent, (newConsent) => {
    consent.value = newConsent ? 'all' : 'none';
  }, { immediate: true });

  watch([consent, consentType], ([newConsent, newConsentType]) => {
    if (newConsentType === 'binary') {
      context.parameters.set('tl', newConsent);
      context.parameters.delete('xt');
    }
    else {
      context.parameters.set('xt', newConsent);
      context.parameters.delete('tl');
    }
  }, { immediate: true });

  watch(consent, (newConsent) => {
    context.consentString = newConsent;
  }, { immediate: true });

  return [consent, consentType];
}
