import { createAdhese } from '@adhese/sdk';
import { devtoolsPlugin } from '@adhese/sdk-devtools';

const adhese = createAdhese({
  account: 'demo',
  debug: true,
  consent: true,
  initialSlots: [
    {
      format: 'imu',
      containingElement: 'skyscraper',
      lazyLoadingOptions:{
          rootMargin: "0px"
      },
      setup(context, hooks): void {
        hooks.onBeforeRender((ad) => {
          return {
              ...ad, 
              tag: {type: "hello"}
          }
        });
        hooks.onEmpty(() => {
          /* eslint-disable no-console */
          console.log('triggering empty', context);
        });
        hooks.onError((error)=> {
          console.log("Error for the IMU slot");
          console.log("triggering an", error);
        });
      },
    },
  ],
  location: 'demo.com_electronics',
  refreshOnResize: false,
  plugins: [devtoolsPlugin],
});

window.adhese = adhese;

adhese.addSlot({
  format: 'billboard',
  containingElement: 'leaderboard',
  renderMode: 'inline',
  setup(context, hooks): void {
    hooks.onEmpty(() => {
      console.log('triggering empty', context);
    });
    hooks.onError(()=> {
      console.log("Error for the Billboard slot");
      console.log("triggering an Error");
    });
  },
});
