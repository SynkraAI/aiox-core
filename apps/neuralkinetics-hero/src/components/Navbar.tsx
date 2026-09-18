import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="7" height="20" rx="3.5" fill="#000000" transform="rotate(-35 5.5 12)" />
      <rect x="15" y="2" width="7" height="20" rx="3.5" fill="#000000" transform="rotate(-35 18.5 12)" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
      <circle cx="10" cy="2" r="1.5" fill="#ffffff" />
      <circle cx="2" cy="10" r="1.5" fill="#ffffff" />
      <circle cx="10" cy="10" r="1.5" fill="#ffffff" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="navbar-left">
        <div className="brand">
          <LogoIcon />
          <span className="brand-text">NeuralKinetics</span>
        </div>

        <button type="button" className="menu-button">
          <span className="circle">
            <Plus size={12} strokeWidth={3} color="#000000" />
          </span>
          <span className="label">Menu</span>
        </button>

        <div className="tags-pill">
          <span>Advanced Bionics</span>
          <span className="divider">/</span>
          <span>Cognitive AI</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="systems-pill">
          <span className="circle">
            <GridIcon />
          </span>
          <span className="label">Adaptive Systems</span>
        </div>
      </div>
    </motion.nav>
  );
}
