import type { ReactElement } from 'react';
import { FronttailSettings } from './fronttailSettings';

const settingClasses = 'border-solid border-b-2 border-accent pb-8 mb-8 last:mb-0 last:pb-0 last:border-0';

// eslint-disable-next-line ts/naming-convention
export function Settings(): ReactElement {
  return (
    <div>
      <FronttailSettings className={settingClasses} />
    </div>
  );
}
