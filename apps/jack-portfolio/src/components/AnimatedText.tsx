import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef, type CSSProperties } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const characters = text.split('');

  return (
    <p ref={containerRef} className={className} style={style}>
      {characters.map((char, index) => {
        const start = index / characters.length;
        const end = start + 1 / characters.length;
        return (
          <Character
            key={`${char}-${index}`}
            progress={scrollYProgress}
            range={[start, end]}
            char={char}
          />
        );
      })}
    </p>
  );
}

function Character({
  progress,
  range,
  char,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  char: string;
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  const display = char === ' ' ? ' ' : char;

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ opacity: 0.2 }} aria-hidden="true">
        {display}
      </span>
      <motion.span style={{ opacity, position: 'absolute', left: 0, top: 0 }}>
        {display}
      </motion.span>
    </span>
  );
}
