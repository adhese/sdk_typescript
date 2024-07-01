import type { ReactElement } from 'react';
import { Button } from './button';

// eslint-disable-next-line ts/naming-convention
export function PreviewButton(): ReactElement {
  return (
    <>
      {
        window.location.search.includes('adhesePreviewCreativeId') && (
          <Button
            onClick={() => {
              const currentUrl = new URL(window.location.href);

              window.location.replace(`${currentUrl.origin}${currentUrl.pathname === '/' ? '' : currentUrl.pathname}`);
            }}
            variant="secondary"
          >
            Disable preview mode
          </Button>
        )
      }
    </>
  );
}
