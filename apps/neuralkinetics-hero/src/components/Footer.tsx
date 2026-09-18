import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

const TAGS = ['Neuromorphic', 'AGI', 'Cybernetics'];

export default function Footer() {
  return (
    <motion.div
      className="footer-wrapper"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: EASE }}
    >
      <div className="footer-left">
        <motion.div
          className="footer-subtitle"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
        >
          <span className="dot" />
          <span>Best digital banking card 2026</span>
        </motion.div>

        <motion.h1
          className="footer-heading"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
        >
          One Card, Zero
          <br />
          Limits. Worldwide.
        </motion.h1>

        <motion.div
          className="footer-buttons"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
        >
          <button type="button" className="btn-primary">
            See Features
          </button>
          <button type="button" className="btn-secondary">
            How It Works
          </button>
        </motion.div>
      </div>

      <div className="footer-right">
        {TAGS.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
