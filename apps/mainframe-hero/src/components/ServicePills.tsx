import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

const SERVICE_OPTIONS = ['Brand', 'Digital', 'Campaign', 'Other'];

export default function ServicePills() {
  const [services, setServices] = useState<string[]>([]);

  const toggleService = (service: string) => {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-medium tracking-tight mb-2">What sort of service?</h2>
      <p className="opacity-85 text-[#738273] mb-8">Select all that apply</p>

      <div className="flex flex-wrap gap-3">
        {SERVICE_OPTIONS.map((option) => {
          const isActive = services.includes(option);

          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => toggleService(option)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors ${
                isActive
                  ? 'bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5 transform'
                  : 'bg-white text-[#1C2E1E] border border-[#F1F3F1] hover:bg-[#F1F3F1]/55'
              }`}
            >
              {option}
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="inline-flex"
                >
                  <Check size={16} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {services.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="italic text-xs mt-6"
          >
            Please click to select services above.
          </motion.p>
        ) : (
          <motion.div
            key="active"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mt-6 overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl px-6 py-4">
              <p className="text-sm text-[#1C2E1E]">
                Ready to inquire about: {services.join(', ')}
              </p>
              <button
                type="button"
                className="text-[#4D6D47] uppercase text-xs font-medium hover:opacity-70 transition-opacity"
              >
                Let&apos;s Go &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
