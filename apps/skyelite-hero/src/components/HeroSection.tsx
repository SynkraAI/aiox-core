import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = ['Start', 'Story', 'Rates', 'Benefits', 'FAQ'];

export default function HeroSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section className="relative h-screen overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative flex h-full flex-col">
        <nav className="relative mx-auto w-full max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-gray-900">SkyElite</span>

            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-gray-900 transition-colors hover:text-gray-700"
                >
                  {link}
                </a>
              ))}
            </div>

            <button
              type="button"
              className="text-gray-900 md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="absolute inset-x-4 top-full mt-2 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur md:hidden">
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-900 transition-colors hover:text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="flex flex-1 items-center justify-center">
          <div className="-mt-80 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">
              PRIVATE JETS
            </p>

            <h1 className="leading-none tracking-tighter">
              <span className="block text-6xl font-normal text-gray-500 md:text-7xl lg:text-8xl">
                Premium.
              </span>
              <span className="-mt-3 block text-6xl font-normal text-[#202A36] md:text-7xl lg:text-8xl">
                Accessible.
              </span>
            </h1>

            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600 md:text-xl">
              Your dedication deserves recognition.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="rounded-full bg-gray-300 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400"
              >
                Discover
              </button>
              <button
                type="button"
                className="rounded-full bg-[#202A36] px-4 py-2 font-medium text-white transition-colors hover:bg-[#1a2229]"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
