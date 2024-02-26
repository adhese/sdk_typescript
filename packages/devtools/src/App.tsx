import type { AdheseContext, Slot } from '@core';
import { type ReactElement, useEffect, useMemo, useState } from 'react';

// eslint-disable-next-line ts/naming-convention
export function App({ adheseContext }: {
  adheseContext: AdheseContext;
}): ReactElement {
  const [slots, setSlots] = useState<ReadonlyArray<Slot>>([]);

  useEffect(() => {
    function onSlotsChange(newSlots: ReadonlyArray<Slot>): void {
      setSlots(newSlots);
    }

    adheseContext.events?.changeSlots.addListener(onSlotsChange);

    return (): void => {
      adheseContext.events?.changeSlots.removeListener(onSlotsChange);
    };
  }, []);

  const formattedSlots = useMemo(() => slots.map(slot => ({
    ...slot,
    name: slot.getName(),
    ad: slot.getAd(),
  })), [slots]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#fafafa',
      blockSize: 'fit-content',
      inlineSize: 'fit-content',
      padding: '10px',
    }}
    >
      {
        formattedSlots.length > 0
          ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Format</th>
                  <th>Location</th>
                  <th>Loaded</th>
                  <th>Rendered</th>
                  <th>Campaign ID</th>
                  <th>Booking ID</th>
                  <th>Creative ID</th>
                  <th>Traffic ID</th>
                  <th>Creative type</th>
                </tr>
              </thead>
              <tbody>
                {formattedSlots.map(({ ad, name, format, location, ...slot }) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{format}</td>
                    <td>{location}</td>
                    <td>{ad ? '✅' : '❌'}</td>
                    <td>{slot.getElement() ? '✅' : '❌'}</td>
                    <td>
                      {ad?.orderId
                        ? (
                          <a
                            href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/editCampaign/${ad.orderId}`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                          >
                            {ad.orderId}
                          </a>
                          )
                        : '-'}
                    </td>
                    <td>
                      {ad?.adspaceId
                        ? (
                          <a
                            href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/bookingDetail/${ad.adspaceId}/${ad.orderId}`}

                            target="_blank"
                            referrerPolicy="no-referrer"
                          >
                            {ad.adspaceId}
                          </a>
                          )
                        : '-'}
                    </td>
                    <td>
                      {ad?.libId
                        ? (
                          <a
                            href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/creativeDetail/${ad.libId}/${ad.orderId}`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                          >
                            {ad.libId}
                          </a>
                          )
                        : '-'}
                    </td>
                    <td>{ad?.id ?? '-'}</td>
                    <td>{ad?.ext ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )
          : 'No slots available'
      }
    </div>
  );
}
