import { useAdhese } from "@adhese/sdk-react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const products = [
  {
    id: 1,
    name: "The Minimalist Watch",
    price: 195,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
  },
  {
    id: 2,
    name: "Leather Weekender Bag",
    price: 285,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
  },
  {
    id: 3,
    name: "Wireless Earbuds Pro",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
  },
  {
    id: 4,
    name: "Ceramic Pour Over Set",
    price: 68,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop",
  },
  {
    id: 5,
    name: "Merino Wool Sweater",
    price: 165,
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop",
  },
  {
    id: 6,
    name: "Desk Organizer",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
  },
  {
    id: 7,
    name: "Cotton Canvas Tote",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop",
  },
  {
    id: 8,
    name: "Portable Speaker",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
  },
];

// eslint-disable-next-line ts/explicit-function-return-type, ts/explicit-module-boundary-types, ts/naming-convention
export function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] bg-[#f5f5f0]">
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 w-full">
            <div className="max-w-xl">
              <h1 className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
                New Season Essentials
              </h1>
              <p className="text-lg text-white/90 mb-8">
                Thoughtfully designed products for modern living.
              </p>
              <a
                href="#"
                className="inline-block bg-white text-black px-8 py-4 text-sm tracking-wide hover:bg-gray-100 transition-colors"
              >
                Shop Collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex justify-center">
            <div id="slot-leaderboard" />
          </div>
        </div>
      </section>

      {/* Product Carousel with Sponsored Slide */}
      <section className="py-20 bg-[#f5f5f0]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-3">Trending Now</h2>
            <p className="text-gray-600">Discover what's popular this season</p>
          </div>

          <div className="relative">
            {/* Custom Navigation Buttons */}
            <button className="carousel-prev">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button className="carousel-next">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{
                prevEl: ".carousel-prev",
                nextEl: ".carousel-next",
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              className="product-carousel"
            >
              {products.slice(0, 3).map((product) => (
                <SwiperSlide key={product.id}>
                  <CarouselProductCard product={product} />
                </SwiperSlide>
              ))}

              {/* Sponsored Slide */}
              <SwiperSlide>
                <div className="bg-white h-full">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white px-2 py-1">
                        Sponsored
                      </span>
                    </div>
                    <div className="w-full h-full [&>div]:w-full [&>div]:h-full [&>div>*]:w-full [&>div>*]:h-full [&>div>*]:object-contain">
                      <div id="slot-carousel" />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400">Advertisement</p>
                  </div>
                </div>
              </SwiperSlide>

              {products.slice(3, 7).map((product) => (
                <SwiperSlide key={product.id}>
                  <CarouselProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Split Banner */}
      <section className="grid md:grid-cols-2">
        <div className="relative h-[500px] bg-[#e8e4df]">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop"
            alt="Collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="h-[500px] bg-[#f5f5f0] flex items-center justify-center p-12">
          <div className="max-w-md text-center">
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
              The Edit
            </p>
            <h2 className="text-3xl font-light mb-4">Home Office Collection</h2>
            <p className="text-gray-600 mb-8">
              Elevate your workspace with pieces designed for productivity and
              comfort.
            </p>
            <a
              href="#"
              className="inline-block border border-black px-8 py-3 text-sm tracking-wide hover:bg-black hover:text-white transition-colors"
            >
              Explore
            </a>
          </div>
        </div>
      </section>

      {/* Native Ad Section - Custom Rendering (renderMode: 'none') */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              Sponsored Content
            </span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              renderMode: none
            </span>
          </div>
          <NativeAd />
        </div>
      </section>

      {/* Responsive Banner - Changes format based on viewport */}
      <section className="py-8 bg-[#f5f5f0]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              Responsive Ad
            </span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              leaderboard / mobile-banner
            </span>
          </div>
          <div className="flex justify-center">
            <div id="slot-responsive" />
          </div>
        </div>
      </section>

      {/* Products with Sponsored */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-light">New Arrivals</h2>
            </div>
            <a href="#" className="text-sm underline hover:no-underline">
              View all
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {/* Sponsored Product */}
            <div className="group">
              <div className="relative aspect-square bg-gray-100 mb-4 overflow-hidden flex items-center justify-center">
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white px-2 py-1">
                    Sponsored
                  </span>
                </div>
                <div className="w-full h-full [&>div]:w-full [&>div]:h-full [&>div>*]:w-full [&>div>*]:h-full [&>div>*]:object-contain">
                  <div id="slot-halfwidth" />
                </div>
              </div>
            </div>

            {products.slice(4, 7).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {/* Another Sponsored */}
            <div className="group">
              <div className="relative aspect-square bg-gray-100 mb-4 overflow-hidden flex items-center justify-center">
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white px-2 py-1">
                    Sponsored
                  </span>
                </div>
                <div className="w-full h-full [&>div]:w-full [&>div]:h-full [&>div>*]:w-full [&>div>*]:h-full [&>div>*]:object-contain">
                  <div id="slot-imu" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Banner */}
      <section className="relative h-[60vh] bg-[#2d2d2d]">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=800&fit=crop"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative h-full flex items-center justify-center text-center">
          <div className="max-w-2xl px-6">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Subscribe & Save
            </h2>
            <p className="text-white/80 mb-8">
              Join our newsletter for exclusive offers and 15% off your first
              order.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 text-sm focus:outline-none bg-white text-black placeholder:text-gray-400"
              />
              <button className="bg-black text-white px-8 py-4 text-sm hover:bg-gray-800 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-light mb-12">Shop All</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="text-xs uppercase tracking-wider mb-4">
                    Categories
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <a href="#" className="hover:text-black">
                        All Products
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-black">
                        Accessories
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-black">
                        Home
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Sidebar Ad */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
                    Advertisement
                  </p>
                  <div id="slot-skyscraper" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Ad */}
      <section className="border-t border-gray-100 py-12 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              Advertisement
            </span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              renderMode: iframe (DALE)
            </span>
          </div>
          <div className="flex justify-center overflow-x-auto">
            <div id="slot-billboard" className="flex-shrink-0" />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: (typeof products)[0] }) {
  return (
    <a href="#" className="group">
      <div className="relative aspect-square bg-[#f5f5f0] mb-4 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          className="absolute bottom-4 left-4 right-4 bg-white py-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          Quick Add
        </button>
      </div>
      <h3 className="text-sm mb-1">{product.name}</h3>
      <p className="text-sm text-gray-600">${product.price}</p>
    </a>
  );
}

// eslint-disable-next-line ts/explicit-function-return-type, ts/naming-convention
function CarouselProductCard({ product }: { product: (typeof products)[0] }) {
  return (
    <a href="#" className="block bg-white group h-full">
      <div className="relative aspect-square bg-[#f5f5f0] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600">${product.price}</p>
      </div>
    </a>
  );
}

// Native Ad with Custom Rendering (renderMode: 'none')
// This demonstrates how to render ad data yourself instead of using iframe/inline
// eslint-disable-next-line ts/explicit-function-return-type, ts/naming-convention
function NativeAd() {
  const adhese = useAdhese();

  // Find the native slot from the slots Map
  const slot = adhese?.getAll().find((s) => s.name?.includes("native"));
  const ad = slot?.data;

  // Parse native ad data from the response
  // In real scenarios, native ads return structured JSON data
  // ext is a JSON string that needs to be parsed
  let nativeData = {
    title: "Premium Wireless Headphones",
    description:
      "Experience crystal-clear sound with our latest noise-cancelling technology. Perfect for work and travel.",
    cta: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop",
    brand: "AudioTech Pro",
    rating: 4.8,
  };

  if (ad?.ext) {
    try {
      const parsedExt = JSON.parse(ad.ext as string);
      if (parsedExt?.native) {
        nativeData = parsedExt.native;
      }
    } catch {
      // Use default data
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="relative aspect-[2/1] md:aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
        <img
          src={nativeData.image}
          alt={nativeData.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {nativeData.brand}
          </span>
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            {nativeData.rating}
          </span>
        </div>
        <h3 className="text-2xl font-light mb-3">{nativeData.title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {nativeData.description}
        </p>
        <button className="bg-black text-white px-8 py-3 text-sm tracking-wide hover:bg-gray-800 transition-colors">
          {nativeData.cta}
        </button>
      </div>
      {/* Hidden container for slot registration */}
      <div id="slot-native" className="hidden" />
    </div>
  );
}
