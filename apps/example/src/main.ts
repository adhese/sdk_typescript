import { createAdhese } from '@adhese/sdk';
import { devtoolsPlugin } from '@adhese/sdk-devtools';

const adhese = createAdhese({
  account: 'adusatest',
  debug: true,
  consent: true,
  initialSlots: [
    {
      format: 'flex',
      slot: "_1",
      containingElement: 'skyscraper',
      setup(context, hooks): void {
        hooks.onEmpty(() => {
          /* eslint-disable no-console */
          console.log('triggering empty', context);
        });
        hooks.onImpressionTracked((ad)=> {
          console.log("Impression Tracked fire for:", ad)
        })
        hooks.onViewableTracked((ad)=> {
          console.log("Viewable Impression tracked fire for:", ad)
        })
      },   
      width: "970px",
      height: "250px"
    },
  ],
  location: 'stopandshop.com_website_home',
  refreshOnResize: false,
  plugins: [devtoolsPlugin],
});

window.adhese = adhese;

adhese.addSlot({
  format: 'flex',
  containingElement: 'leaderboard',
  slot:"_2",
  renderMode: 'inline',
  setup(context, hooks): void {
    hooks.onEmpty(() => {
      console.log('triggering empty', context);
    });
    hooks.onImpressionTracked((ad)=> {
      console.log("Impression Tracked fire for:", ad)
    })
    hooks.onViewableTracked((ad)=> {
      console.log("Viewable Impression tracked fire for:", ad)
    })
  },    
  width: "970px",
  height: "250px"
});
