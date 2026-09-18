import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import LiveProjectButton from '@/components/LiveProjectButton';
import { PROJECTS, type Project } from '@/data/projects';

const CARD_RADIUS = 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px]';

interface ProjectCardProps {
  project: Project;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

function ProjectCard({ project, index, progress, range, targetScale }: ProjectCardProps) {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      className="sticky top-24 h-[85vh] md:top-32"
      style={{ top: `${index * 28}px` }}
    >
      <motion.div
        style={{ scale, top: `${index * 28}px` }}
        className={`relative flex h-full w-full flex-col gap-6 border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 ${CARD_RADIUS} sm:p-6 md:p-8`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="font-black text-[#0C0C0C]"
            style={{
              fontSize: 'clamp(3rem, 10vw, 140px)',
              WebkitTextStroke: '1.5px #D7E2EA',
            }}
          >
            {project.number}
          </span>

          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">
              {project.category}
            </span>
            <h3 className="text-xl font-medium uppercase text-[#D7E2EA] sm:text-2xl md:text-3xl">
              {project.name}
            </h3>
          </div>

          <LiveProjectButton />
        </div>

        <div className="flex flex-1 gap-3">
          <div className="flex w-[40%] flex-col gap-3">
            <img
              src={project.col1Image1}
              alt={`${project.name} detail 1`}
              loading="lazy"
              className={`w-full object-cover ${CARD_RADIUS}`}
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
            />
            <img
              src={project.col1Image2}
              alt={`${project.name} detail 2`}
              loading="lazy"
              className={`w-full flex-1 object-cover ${CARD_RADIUS}`}
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
            />
          </div>

          <div className="w-[60%]">
            <img
              src={project.col2Image}
              alt={project.name}
              loading="lazy"
              className={`h-full w-full object-cover ${CARD_RADIUS}`}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const totalCards = PROJECTS.length;

  return (
    <section
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 py-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:py-32"
      ref={containerRef}
    >
      <h2
        className="hero-heading mb-16 text-center font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Project
      </h2>

      <div className="mx-auto flex max-w-5xl flex-col">
        {PROJECTS.map((project, index) => {
          const targetScale = 1 - (totalCards - 1 - index) * 0.03;
          const range: [number, number] = [index / totalCards, 1];

          return (
            <ProjectCard
              key={project.number}
              project={project}
              index={index}
              progress={scrollYProgress}
              range={range}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </section>
  );
}
