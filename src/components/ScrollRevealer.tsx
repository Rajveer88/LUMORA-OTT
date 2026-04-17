import React from 'react';
import { motion } from 'motion/react';
import { useInView } from '../hooks/useInView';

interface ScrollRevealerProps {
  children: React.ReactNode;
  key?: React.Key;
}

export default function ScrollRevealer({ children }: ScrollRevealerProps) {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
