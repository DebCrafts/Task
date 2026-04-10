import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';

export function SplashScreen() {
  const { splashScreenShown, setSplashScreenShown } = useStore();
  const [isVisible, setIsVisible] = useState(!splashScreenShown);

  useEffect(() => {
    if (!splashScreenShown) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setSplashScreenShown(true), 500); // Wait for exit animation
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [splashScreenShown, setSplashScreenShown]);

  if (splashScreenShown) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
              >
                <CheckCircle2 className="w-24 h-24 text-[var(--primary)]" strokeWidth={1.5} />
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-[var(--primary)] rounded-full opacity-20 blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-6 text-3xl font-light tracking-tight text-[var(--foreground)]"
            >
              Task<span className="font-semibold">Flow</span>
            </motion.h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
