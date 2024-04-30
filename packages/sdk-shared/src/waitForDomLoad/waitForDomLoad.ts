export async function waitForDomLoad(): Promise<void> {
  return new Promise((resolve) => {
    function onDomLoad(): void {
      resolve();
      window.removeEventListener('DOMContentLoaded', onDomLoad);
    }

    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', onDomLoad);
    else
      resolve();
  });
}
