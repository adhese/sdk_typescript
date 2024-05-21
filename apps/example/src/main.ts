import { type AdheseAd, createAdhese } from '@adhese/sdk';
import { devtoolsPlugin } from '@adhese/sdk-devtools';
import { stackSlotsPlugin } from '@adhese/sdk-stack-slots';

type CustomAdTag = {
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
};

function renderHalfwidth(data: CustomAdTag): string {
  const heading = data.native.assets.find(asset => asset.id === 1)?.title?.text;
  const image = data.native.assets.find(asset => asset.id === 3)?.img;
  const backgroundColor = data.native.assets.find(asset => asset.id === 6)?.data?.value;
  const link = data.native.link.url;
  const linkText = data.native.assets.find(asset => asset.id === 2)?.data?.value;

  return `
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
    </a>`;
}

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
      setup(_, { onBeforeRender }): void {
        onBeforeRender((data) => {
          const ad = data as AdheseAd<CustomAdTag>;

          if (typeof ad.tag === 'string')
            return ad as AdheseAd<string>;

          return {
            ...ad,
            tag: renderHalfwidth(ad.tag),
          };
        });
      },
    },
  ],
  location: '_sdk_example_',
  plugins: [devtoolsPlugin, stackSlotsPlugin],
});

window.adhese = adhese;

adhese.addSlot({
  format: 'newstack',
  containingElement: 'newstack',
  type: 'stacks',
  setup(_, hooks) {
    hooks.onBeforeRender((data) => {
      const ad = data as AdheseAd<ReadonlyArray<CustomAdTag>>;

      if (typeof ad.tag === 'string')
        return ad as AdheseAd<string>;

      return {
        ...ad,
        tag: ad.tag.map(renderHalfwidth).join(''),
      };
    });
  },
});

adhese.addSlot({
  format: 'leaderboard',
  containingElement: 'leaderboard',
  renderMode: 'inline',
});

adhese.addSlot({
  format: 'imu',
  containingElement: 'imu',
  lazyLoading: true,
  lazyLoadingOptions: {
    rootMargin: '0px',
  },
});
