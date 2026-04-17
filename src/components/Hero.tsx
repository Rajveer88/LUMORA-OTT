import React, { useState, useEffect, useCallback } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Content } from '../data/content';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { getTitleFontClass } from '../utils/typography';
import { LumoraOriginalBadge } from './ui/LumoraOriginalBadge';

interface HeroProps {
  featuredContent: Content[];
}

export default function Hero({ featuredContent }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const content = featuredContent[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
  }, [featuredContent.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
  }, [featuredContent.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  useEffect(() => {
    setIsVideoPlaying(false);
    const timer = setTimeout(() => {
      setIsVideoPlaying(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (!content) return null;

  return (
    <div 
      className="relative w-full h-[65vh] md:h-[85vh] lg:h-[95vh] overflow-hidden bg-bg-theme flex items-end"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
  key={content.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
        >
          {/* Background Layer */}
          <div className="absolute inset-0 z-0 bg-bg-theme">
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="w-full h-full relative"
            >
              <div 
                className="absolute inset-0 z-10 opacity-30 md:opacity-40 mix-blend-overlay"
                style={{ backgroundColor: content.accentColor }}
              />
              <img 
                src={content.backdropUrl || `https://picsum.photos/seed/${content.id}/1920/1080`} 
                alt={content.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {isVideoPlaying && content.videoUrl && (
              <motion.video
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                src={content.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60 hidden md:block"
              />
            )}
          </div>

          {/* Atmospheric Gradients */}
          <div className="absolute inset-0 z-10 hero-gradient md:bg-none" style={{ background: 'linear-gradient(to top, rgba(5,5,7,1) 0%, rgba(5,5,7,0.8) 20%, transparent 60%)' }} />
          <div className="absolute inset-0 z-10 hidden md:block" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.2), transparent)' }} />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg-theme via-transparent to-transparent opacity-90 hidden md:block" />
          
          {/* Content Layer */}
          <div className="relative z-20 px-6 md:px-12 pb-12 md:pb-32 w-full max-w-5xl space-y-4 md:space-y-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-4 md:mb-6">
                {(content.isOriginal || content.studio === 'LUMORA Studios') && (
                  <LumoraOriginalBadge size="sm" className="mr-2" />
                )}
                <span 
                  className="bg-black/40 border px-2 md:px-3 py-1 text-[8px] md:text-[10px] uppercase font-bold tracking-[2px] text-white rounded-full flex items-center gap-2"
                  style={{ borderColor: `${content.accentColor}66` }}
                >
                  <span 
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse" 
                    style={{ backgroundColor: content.accentColor }} 
                  />
                  Featured
                </span>
                
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 md:px-3 py-1 rounded-full">
                  <span className="text-[9px] md:text-[11px] font-black text-white">{content.matchPercentage}% Match</span>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  {content.genre.slice(0, 1).map((g, idx) => (
                    <span key={idx} className="text-[9px] md:text-[10px] text-white/50 font-bold tracking-widest uppercase px-2 py-1 border border-white/5 rounded-md">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              
              <h2 className={cn(
                "text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-white leading-tight mb-2 md:mb-4",
                getTitleFontClass(content.genre)
              )} style={{ textShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.1)" }}>
                {content.title}
              </h2>
              
              <p className="text-[13px] md:text-[16px] text-white/70 max-w-[550px] leading-[1.6] mb-6 md:mb-8 font-medium drop-shadow-lg line-clamp-2 md:line-clamp-none">
                "{content.description}"
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-2 w-full sm:w-auto">
                <Link
                  to={`/watch/${content.id}`}
                  className="group flex items-center justify-center gap-3 bg-white text-black px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold hover:scale-105 transition-all text-[14px] md:text-[15px] shadow-[0_10px_20px_rgba(255,255,255,0.1)] w-full sm:w-auto"
                >
                  <Play className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] fill-current" />
                  Experience Now
                </Link>
                
                <Link
                  to={`/title/${content.id}`}
                  className="group flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold hover:bg-white/10 hover:border-white/20 transition-all text-[14px] md:text-[15px] backdrop-blur-xl w-full sm:w-auto"
                >
                  <Info className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                  Intelligence
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls - Hidden on mobile */}
      <div className="absolute bottom-12 right-12 z-30 hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 mr-6 h-1 w-32 bg-white/10 rounded-full overflow-hidden">
           <motion.div 
             key={currentIndex}
             initial={{ width: '0%' }}
             animate={{ width: '100%' }}
             transition={{ duration: 8, ease: 'linear' }}
             className="h-full"
             style={{ backgroundColor: content.accentColor }}
           />
        </div>

        <button 
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Pagination Dots - Hidden on mobile */}
      <div className="absolute bottom-12 left-12 z-30 hidden md:flex flex-col gap-3">
        {featuredContent.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "w-1 transition-all duration-500 rounded-full",
              idx === currentIndex ? "h-8" : "h-3 bg-white/20"
            )}
            style={{ backgroundColor: idx === currentIndex ? content.accentColor : '' }}
          />
        ))}
      </div>
    </div>
  );
}
