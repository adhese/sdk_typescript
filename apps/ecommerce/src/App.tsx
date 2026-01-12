import { AdheseProvider } from '@adhese/sdk-react';
import { HomePage } from './pages/HomePage';

export function App() {
  return (
    <AdheseProvider
      options={{
        account: 'demo',
        debug: true,
        location: '_sdk_ecommerce_',
        consent: false,
        eagerRendering: true,
        findDomSlotsOnLoad: false,
        refreshOnResize: true,
        viewabilityTracking: true,
        initialSlots: [
          // Inline rendering (direct DOM injection)
          {
            format: 'leaderboard',
            containingElement: 'slot-leaderboard',
            renderMode: 'inline',
          },
          {
            format: 'halfwidthsmallresponsive',
            containingElement: 'slot-halfwidth',
            renderMode: 'inline',
          },
          {
            format: 'mediumrectangle',
            containingElement: 'slot-carousel',
            renderMode: 'inline',
          },
          {
            format: 'imu',
            containingElement: 'slot-imu',
            lazyLoading: true,
            renderMode: 'inline',
          },
          // Iframe rendering (sandboxed)
          {
            format: 'skyscraper',
            containingElement: 'slot-skyscraper',
            lazyLoading: true,
            renderMode: 'iframe',
          },
          {
            format: 'billboard',
            containingElement: 'slot-billboard',
            lazyLoading: true,
            renderMode: 'iframe',
          },
          // Custom rendering (renderMode: 'none' - we handle it ourselves)
          {
            format: 'native',
            containingElement: 'slot-native',
            renderMode: 'none',
          },
          // Responsive format (changes based on viewport)
          {
            format: [
              { format: 'leaderboard', query: '(min-width: 768px)' },
              { format: 'mobile-banner', query: '(max-width: 767px)' },
            ],
            containingElement: 'slot-responsive',
            renderMode: 'inline',
          },
        ],
      }}
    >
      <div className="min-h-screen bg-white flex flex-col">
        {/* Announcement Bar */}
        <div className="bg-[#208468] text-white text-center py-2.5 text-sm">
          Free shipping on orders over $75.{' '}
          <a href="#" className="underline ml-1">
            Shop now
          </a>
        </div>

        <Header />
        <main className="flex-1">
          <HomePage />
        </main>
        <Footer />
      </div>
    </AdheseProvider>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="text-2xl tracking-tight font-medium">
            ADHESE DEMO
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm hover:opacity-70 transition-opacity">
              Shop
            </a>
            <a href="#" className="text-sm hover:opacity-70 transition-opacity">
              Collections
            </a>
            <a href="#" className="text-sm hover:opacity-70 transition-opacity">
              About
            </a>
            <a href="#" className="text-sm hover:opacity-70 transition-opacity">
              Journal
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button className="hover:opacity-70 transition-opacity">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </button>
            <button className="hover:opacity-70 transition-opacity relative">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-5">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Best Sellers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Sale
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-5">
              Newsletter
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe for updates and 10% off your first order.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black"
              />
              <button className="bg-black text-white px-5 py-2.5 text-sm hover:bg-gray-800 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026. Adhese demo ecommerce.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
