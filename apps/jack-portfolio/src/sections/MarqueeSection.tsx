import { useEffect, useRef, useState } from 'react';
import { MARQUEE_ROW_1, MARQUEE_ROW_2 } from '@/data/marqueeImages';

const TILE_CLASS = 'h-[270px] w-[420px] flex-shrink-0 rounded-2xl object-cover';

function tripled(images: readonly string[]) {
  return [...images, ...images, ...images];
}

const ROW_1_IMAGES = tripled(MARQUEE_ROW_1);
const ROW_2_IMAGES = tripled(MARQUEE_ROW_2);

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40">
      <div className="flex flex-col gap-3">
        <div
          className="flex gap-3"
          style={{ transform: `translateX(${offset - 200}px)`, willChange: 'transform' }}
        >
          {ROW_1_IMAGES.map((src, index) => (
            <img key={`row1-${index}`} src={src} alt="" loading="lazy" className={TILE_CLASS} />
          ))}
        </div>

        <div
          className="flex gap-3"
          style={{ transform: `translateX(${-(offset - 200)}px)`, willChange: 'transform' }}
        >
          {ROW_2_IMAGES.map((src, index) => (
            <img key={`row2-${index}`} src={src} alt="" loading="lazy" className={TILE_CLASS} />
          ))}
        </div>
      </div>
    </section>
  );
}
