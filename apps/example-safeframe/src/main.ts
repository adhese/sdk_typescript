import { type Ad, createAdhese } from '@adhese/sdk';

async function app(): Promise<void> {
  const adhese = createAdhese({
    account: 'demo',
    debug: true,
    initialSlots: [
      {
        format: 'skyscraper',
        containingElement: 'skyscraper',
      },
      {
        format: 'halfwidthsmallresponsive',
        containingElement: 'halfwidthsmallresponsive',
        renderMode: 'inline',
        onBeforeRender(ad: Ad<{
          type: string;
          native: {
            ver: string;
            assets: ReadonlyArray<{
              id: number;
              title?: {
                text: string;
              };
              data?: {
                type: number;
                value: string;
              };
              img?: {
                url: string;
                w: string;
                h: string;
              };
            }>;
            link: {
              url: string;
              fallback: string;
            };
          };
        }>): Ad<string> {
          if (typeof ad.tag === 'string')
            return ad as Ad<string>;

          const heading = ad.tag.native.assets.find(asset => asset.id === 1)?.title?.text;
          const image = ad.tag.native.assets.find(asset => asset.id === 3)?.img;
          const backgroundColor = ad.tag.native.assets.find(asset => asset.id === 6)?.data?.value;
          const link = ad.tag.native.link.url;
          const linkText = ad.tag.native.assets.find(asset => asset.id === 2)?.data?.value;

          return {
            ...ad,
            tag: `
            <a href="${link}" style="
              background-image: url(${image?.url});
              height: ${image?.h}px;
              background-size: contain;
              background-position: right center;
              background-repeat: no-repeat;
              background-color: ${backgroundColor};
              padding: 20px;
              max-width: ${image?.w}px;
              display: block">
              <div style="
                max-width: 40%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;">
                <h2 style="font-weight: bold; font-size: 24px;">${heading}</h2>
                <p>${linkText}</p>
              </div>
            </a>`,
          };
        },
      },
    ],
    location: '_sdk_example_',
    safeFrame: true,
  });

  window.adhese = adhese;

  await adhese.addSlot({
    format: 'leaderboard',
    containingElement: 'leaderboard',
  });

  await adhese.addSlot({
    format: 'imu',
    containingElement: 'imu',
    lazyLoading: true,
    lazyLoadingOptions: {
      rootMargin: '0px',
    },
  });
}

app().catch((error) => {
  console.error(error);
});
