import React, { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

interface DownloadButtonProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function DownloadButton({ size = 'md' }: DownloadButtonProps) {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const startDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadState !== 'idle') return;

    setDownloadState('downloading');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setDownloadState('completed');
        setTimeout(() => setDownloadState('idle'), 3000);
      }
      setProgress(currentProgress);
    }, 400);
  };

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const ringData = {
    sm: { r: 10, cx: 12, cy: 12, circ: 63, view: "0 0 24 24" },
    lg: { r: 14, cx: 16, cy: 16, circ: 88, view: "0 0 32 32" },
    md: { r: 12, cx: 14, cy: 14, circ: 75, view: "0 0 28 28" }
  };

  const currentRing = ringData[size];

  return (
    <button
      onClick={startDownload}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all group overflow-hidden",
        sizes[size],
        downloadState === 'idle' ? "bg-white/10 hover:bg-white/20 border border-white/10" : "bg-transparent"
      )}
    >
      <AnimatePresence mode="wait">
        {downloadState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Download className={cn(
              size === 'sm' ? "w-4 h-4" : size === 'lg' ? "w-6 h-6" : "w-5 h-5",
              "text-white"
            )} />
          </motion.div>
        )}

        {downloadState === 'downloading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <svg 
              className="transform -rotate-90"
              width={size === 'sm' ? "24" : size === 'lg' ? "32" : "28"} 
              height={size === 'sm' ? "24" : size === 'lg' ? "32" : "28"}
              viewBox={currentRing.view}
            >
              <circle
                cx={currentRing.cx}
                cy={currentRing.cy}
                r={currentRing.r}
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx={currentRing.cx}
                cy={currentRing.cy}
                r={currentRing.r}
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={currentRing.circ}
                style={{ 
                  strokeDashoffset: currentRing.circ - (currentRing.circ * progress) / 100,
                  transition: 'stroke-dashoffset 0.4s ease-out',
                  '--circumference': currentRing.circ
                } as any}
                className="text-accent-cyan"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[8px] font-black text-white">{Math.round(progress)}%</span>
            </div>
          </motion.div>
        )}

        {downloadState === 'completed' && (
          <motion.div
            key="done"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-green-500 rounded-full w-full h-full flex items-center justify-center"
          >
            <Check className="w-5 h-5 text-black" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
