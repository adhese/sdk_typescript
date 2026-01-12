import { http, HttpResponse } from 'msw';

// Mock ad templates for different formats
const mockAds: Record<string, string> = {
  leaderboard: `
    <div style="width:100%;max-width:728px;height:90px;background:linear-gradient(135deg,#1a1a1a 0%,#333 100%);display:flex;align-items:center;justify-content:space-between;padding:0 32px;font-family:system-ui;color:white;box-sizing:border-box;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:18px;font-weight:500;letter-spacing:-0.5px;white-space:nowrap;">Summer Collection — 30% Off</div>
        <div style="font-size:12px;opacity:0.7;margin-top:4px;">Use code SUMMER30 at checkout</div>
      </div>
      <button style="background:white;color:#1a1a1a;border:none;padding:10px 24px;font-size:13px;font-weight:500;cursor:pointer;letter-spacing:0.5px;flex-shrink:0;margin-left:20px;">Shop Now</button>
    </div>
  `,
  halfwidthsmallresponsive: `
    <div style="width:100%;height:100%;background:linear-gradient(180deg,#f5f5f0 0%,#e8e4df 100%);display:flex;flex-direction:column;font-family:system-ui;position:relative;">
      <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" style="width:100%;height:70%;object-fit:cover;" alt="Product" />
      <div style="padding:16px;flex:1;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:13px;font-weight:500;color:#1a1a1a;">Nike Air Max 270</div>
        <div style="font-size:12px;color:#666;margin-top:2px;">$150</div>
      </div>
    </div>
  `,
  mediumrectangle: `
    <div style="width:100%;height:100%;background:linear-gradient(180deg,#fef3c7 0%,#fde68a 100%);display:flex;flex-direction:column;font-family:system-ui;">
      <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" style="width:100%;height:70%;object-fit:cover;" alt="Product" />
      <div style="padding:16px;flex:1;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:13px;font-weight:500;color:#1a1a1a;">Classic Watch</div>
        <div style="font-size:12px;color:#666;margin-top:2px;">$249</div>
      </div>
    </div>
  `,
  imu: `
    <div style="width:100%;height:100%;background:linear-gradient(180deg,#faf9f7 0%,#f0ebe3 100%);display:flex;flex-direction:column;font-family:system-ui;">
      <img src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop" style="width:100%;height:70%;object-fit:cover;" alt="Product" />
      <div style="padding:16px;flex:1;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:13px;font-weight:500;color:#1a1a1a;">Premium Skincare Set</div>
        <div style="font-size:12px;color:#666;margin-top:2px;">$89</div>
      </div>
    </div>
  `,
  skyscraper: `
    <div style="width:160px;height:600px;background:#faf9f7;display:flex;flex-direction:column;font-family:system-ui;">
      <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=500&fit=crop" style="width:100%;height:60%;object-fit:cover;" alt="Product" />
      <div style="padding:16px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:8px;">Featured</div>
          <div style="font-size:14px;font-weight:500;color:#1a1a1a;line-height:1.4;">Minimalist Desk Lamp</div>
          <div style="font-size:13px;color:#666;margin-top:4px;">$125</div>
        </div>
        <button style="width:100%;background:#1a1a1a;color:white;border:none;padding:12px;font-size:12px;cursor:pointer;">View Product</button>
      </div>
    </div>
  `,
  billboard: `
    <div style="width:100%;max-width:970px;height:250px;background:#1a1a1a;display:flex;align-items:center;font-family:system-ui;color:white;overflow:hidden;">
      <div style="flex:1;padding:40px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;opacity:0.6;margin-bottom:12px;">Limited Edition</div>
        <div style="font-size:32px;font-weight:500;letter-spacing:-1px;margin-bottom:12px;">The Essentials Collection</div>
        <div style="font-size:14px;opacity:0.7;max-width:400px;line-height:1.6;margin-bottom:20px;">Timeless pieces designed for everyday. Crafted with premium materials.</div>
        <button style="background:white;color:#1a1a1a;border:none;padding:14px 32px;font-size:13px;font-weight:500;cursor:pointer;">Explore Collection</button>
      </div>
      <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=400&fit=crop" style="height:100%;width:40%;object-fit:cover;" alt="Collection" />
    </div>
  `,
  // Native ad - returns JSON data for custom rendering
  native: `<div data-native="true"></div>`,
  // Mobile banner for responsive slot
  'mobile-banner': `
    <div style="width:320px;height:50px;background:linear-gradient(90deg,#1a1a1a 0%,#333 100%);display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-family:system-ui;color:white;">
      <div style="font-size:12px;font-weight:500;">Summer Sale — 30% Off</div>
      <button style="background:white;color:#1a1a1a;border:none;padding:6px 12px;font-size:10px;font-weight:500;cursor:pointer;">Shop</button>
    </div>
  `,
};

// Default fallback ad
const defaultAd = `
  <div style="width:100%;height:100%;background:#f5f5f0;display:flex;align-items:center;justify-content:center;font-family:system-ui;color:#999;">
    <div style="text-align:center;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;">Advertisement</div>
    </div>
  </div>
`;

// Native ad data for custom rendering
const nativeAdData = {
  title: 'Premium Wireless Headphones',
  description:
    'Experience crystal-clear sound with our latest noise-cancelling technology. Perfect for work and travel.',
  cta: 'Shop Now',
  image:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop',
  brand: 'AudioTech Pro',
  rating: 4.8,
};

// Formats that should use DALE origin (OpenRTB-style response)
const daleFormats = ['skyscraper', 'billboard'];

export const handlers = [
  // Handle POST requests to Adhese API
  http.post('https://ads-demo.adhese.com/json', async ({ request }) => {
    const body = (await request.json()) as {
      slots: Array<{
        slotname: string;
      }>;
    };

    const response = body.slots.map((slot) => {
      // Extract format from slotname (e.g., "_sdk_ecommerce_-leaderboard" -> "leaderboard")
      // Handle formats with hyphens like "mobile-banner" by splitting on location prefix
      const parts = slot.slotname.split('_sdk_ecommerce_-');
      const format =
        parts.length > 1 ? parts[1] : slot.slotname.split('-').pop() || '';
      const tag = mockAds[format] || defaultAd;
      const isDale = daleFormats.includes(format);

      // Base response
      const baseResponse = {
        adFormat: format,
        adType: format === 'native' ? 'native' : 'html',
        slotID: slot.slotname,
        slotName: slot.slotname,
        tag,
        libId: `mock-${slot.slotname}`,
        id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        width:
          format === 'leaderboard' || format === 'mobile-banner'
            ? '728'
            : format === 'billboard'
              ? '970'
              : format === 'skyscraper'
                ? '160'
                : '300',
        height:
          format === 'leaderboard'
            ? '90'
            : format === 'mobile-banner'
              ? '50'
              : format === 'billboard'
                ? '250'
                : format === 'skyscraper'
                  ? '600'
                  : '250',
        impressionCounter: 'https://example.com/impression',
        viewableImpressionCounter: 'https://example.com/viewable',
      };

      if (isDale) {
        // DALE origin response - uses 'body' field instead of 'tag'
        // SDK transforms body -> tag for DALE responses
        const { tag: _, ...baseWithoutTag } = baseResponse;
        return {
          ...baseWithoutTag,
          origin: 'DALE',
          body: tag, // DALE uses 'body' field, SDK transforms to 'tag'
          originData: {
            seatbid: [
              {
                bid: [
                  {
                    id: `bid-${Date.now()}`,
                    impid: slot.slotname,
                    price: 2.5,
                    adm: tag,
                    ext: {
                      adhese: {
                        viewableImpressionCounter:
                          'https://example.com/dale-viewable',
                      },
                    },
                  },
                ],
                seat: 'mock-dsp',
              },
            ],
          },
        };
      }

      if (format === 'native') {
        // Native ad with structured data for custom rendering
        // ext must be a JSON string per SDK schema
        return {
          ...baseResponse,
          origin: 'JERLICIA',
          ext: JSON.stringify({
            native: nativeAdData,
          }),
        };
      }

      // Standard JERLICIA response
      return {
        ...baseResponse,
        origin: 'JERLICIA',
      };
    });

    return HttpResponse.json(response);
  }),

  // Handle GET requests (legacy format)
  http.get('https://ads-demo.adhese.com/json/*', ({ request }) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const slotIndex = pathParts.indexOf('json');
    const slotNames = pathParts.slice(slotIndex + 1);

    const response = slotNames.map((slotname) => {
      const format = slotname.split('-').pop() || '';
      const tag = mockAds[format] || defaultAd;

      return {
        adFormat: format,
        adType: 'html',
        slotID: slotname,
        slotName: slotname,
        tag,
        libId: `mock-${slotname}`,
        id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        origin: 'JERLICIA',
        impressionCounter: 'https://example.com/impression',
        viewableImpressionCounter: 'https://example.com/viewable',
      };
    });

    return HttpResponse.json(response);
  }),

  // Mock impression tracking (just acknowledge)
  http.get(
    'https://example.com/*',
    () => new HttpResponse(null, { status: 200 }),
  ),
];
