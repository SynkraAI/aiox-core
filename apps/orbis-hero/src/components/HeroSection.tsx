const HERO_TEXT =
  'A digital object fixed beyond time and place. An exploration of distance, form, and silence in space';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative max-w-[1831px] mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12 mb-12 sm:mb-16 md:mb-20">
          <h2 className="font-grotesk text-[32px] sm:text-[48px] md:text-[60px] font-normal uppercase leading-[1.05] sm:leading-[1] md:leading-[1] text-cream relative">
            Hello!
            <br />
            I&apos;m orbis
            <span className="font-condiment text-[36px] sm:text-[52px] md:text-[68px] font-normal normal-case text-neon mix-blend-exclusion leading-[0.79] tracking-[0.03em] absolute right-[-8px] bottom-[-20px] sm:bottom-[-30px] md:bottom-[-40px] -rotate-1 opacity-90">
              Orbis
            </span>
          </h2>

          <p className="font-mono text-[14px] sm:text-[15px] md:text-[16px] uppercase text-cream max-w-[266px] leading-relaxed">
            {HERO_TEXT}
          </p>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-5 max-w-[335px]">
            <p className="font-mono text-[14px] sm:text-[15px] md:text-[16px] uppercase lg:text-cream text-[#010828] opacity-10 leading-relaxed">
              {HERO_TEXT}
            </p>
            <p className="font-mono text-[14px] sm:text-[15px] md:text-[16px] uppercase lg:text-cream text-[#010828] opacity-10 leading-relaxed">
              {HERO_TEXT}
            </p>
          </div>

          <div className="hidden lg:flex flex-col gap-5 max-w-[335px]">
            <p className="font-mono text-[14px] sm:text-[15px] md:text-[16px] uppercase lg:text-cream text-[#010828] opacity-10 leading-relaxed">
              {HERO_TEXT}
            </p>
            <p className="font-mono text-[14px] sm:text-[15px] md:text-[16px] uppercase lg:text-cream text-[#010828] opacity-10 leading-relaxed">
              {HERO_TEXT}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
