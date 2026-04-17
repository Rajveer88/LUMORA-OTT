import React, { useState, useMemo } from 'react';
import ContentRow from '../components/ContentRow';
import ContentItem from '../components/ContentItem';
import { MOCK_CONTENT } from '../data/content';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Film, Tv, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Trending() {
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'series'>('all');

  const trendingContent = useMemo(() => {
    let filtered = MOCK_CONTENT;
    if (activeTab !== 'all') {
      filtered = filtered.filter(c => c.type === activeTab);
    }
    // Use matchPercentage as proxy for popularity/trending score
    return [...filtered].sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 15);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#050507] pt-24 pb-32">
      {/* Dynamic Header Area */}
      <div className="px-6 md:px-12 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-purple/5 blur-[100px] rounded-full -mr-64 -mt-32 z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full w-fit mb-4 md:mb-6"
            >
              <TrendingUp className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[2px] text-accent-cyan">Real-time Surge</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-[-2px] md:tracking-[-4px] leading-tight"
            >
              WHAT THE WORLD<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">IS WATCHING</span>
            </motion.h1>
          </div>

          <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-[16px] md:p-1.5 md:rounded-[20px] backdrop-blur-xl shrink-0 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', icon: Sparkles, label: 'Top Hits' },
              { id: 'movie', icon: Film, label: 'Movies' },
              { id: 'series', icon: Tv, label: 'Series' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-[12px] md:rounded-[14px] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-white text-black shadow-xl" 
                    : "text-white/40 hover:text-white/60"
                )}
              >
                <tab.icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid with Rank Numbers */}
      <div className="px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20 relative z-10">
        <AnimatePresence mode="popLayout">
          {trendingContent.map((item, index) => (
            <motion.div
              key={`${activeTab}-${item.id}`}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              {/* Massive Rank Number in Background */}
              <div className="absolute -top-8 md:-top-12 -left-3 md:-left-6 text-[80px] sm:text-[100px] md:text-[140px] font-black text-white/[0.03] italic tracking-tighter leading-none select-none group-hover:text-accent-cyan/[0.08] transition-colors pointer-events-none z-0">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              
              <div className="relative z-10">
                <ContentItem 
                  item={item} 
                  className="w-full"
                />
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                     <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Surging in {item.language}</span>
                  </div>
                  <div className="text-[12px] font-black text-accent-cyan italic">
                    #{index + 1}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Mock */}
      <div className="mt-24 text-center">
         <div className="w-px h-24 bg-gradient-to-b from-accent-cyan/20 to-transparent mx-auto mb-8" />
         <button className="text-[12px] font-black text-white/40 uppercase tracking-[4px] hover:text-white transition-colors flex items-center gap-4 mx-auto group">
            <span className="w-2 h-2 rounded-full border border-white/20 group-hover:border-accent-cyan transition-colors" />
            End of Intelligence Data
            <span className="w-2 h-2 rounded-full border border-white/20 group-hover:border-accent-cyan transition-colors" />
         </button>
      </div>
    </div>
  );
}
