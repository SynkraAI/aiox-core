import { motion, type Target } from 'framer-motion';
import { useMemo, type ElementType, type ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  as?: ElementType;
  className?: string;
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  as = 'div',
  className,
}: FadeInProps) {
  const Component = useMemo(() => motion.create(as), [as]);

  const hidden: Target = { opacity: 0, x, y };
  const visible: Target = { opacity: 1, x: 0, y: 0 };

  return (
    <Component
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}
