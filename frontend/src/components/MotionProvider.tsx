'use client';

import React from 'react';
import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Silky 60fps GPU-composited scroll progress indicator */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 origin-left z-50 pointer-events-none will-change-transform"
      />
      {children}
    </MotionConfig>
  );
}
