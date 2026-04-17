import React, { useState, useMemo } from 'react';
import Hero from '../components/Hero';
import ContentRow from '../components/ContentRow';
import ScrollRevealer from '../components/ScrollRevealer';
import { MOCK_CONTENT, GENRES } from '../data/content';
import { Filter, X } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Series() {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  
  const series = useMemo(() => {
    let base = MOCK_CONTENT.filter(c => c.type === 'series');
    if (activeGenre) {
      base = base.filter(s => s.genre.includes(activeGenre));
    }
    return base;
  }, [activeGenre]);

  const featuredItems = useMemo(() => {
    return [...series].sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 5);
  }, [series]);

  const rows = useMemo(() => {
    if (series.length === 0) return [];
    
    return [
      { id: 'all', title: activeGenre ? `${activeGenre} Series` : 'Infinite Narratives', items: series },
      { id: 'trending', title: 'Viral Sensations', items: series.filter(s => parseFloat(s.rating) >= 9.0) },
      { id: 'epic', title: 'Epic Worldbuilding', items: series.filter(s => s.tags.includes('Epic')) },
    ].filter(r => r.items.length > 0);
  }, [series, activeGenre]);

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-24 overflow-x-hidden">
      <Hero featuredContent={featuredItems.length > 0 ? featuredItems : MOCK_CONTENT.slice(0, 1)} />
      
      <div className="relative z-30 -mt-16 md:-mt-32 pb-24">
        {/* Genre / Filter Row */}
        <div className="px-4 md:px-12 mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none no-scrollbar">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[2px] text-white/40 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </div>
            
            <div className="flex items-center gap-2">
              {GENRES.map(genre => (
                <button 
                  key={genre}
                  onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
                  className={cn(
                    "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all border whitespace-nowrap",
                    activeGenre === genre 
                      ? "bg-white text-black border-white shadow-xl scale-105" 
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                  )}
                >
                  {genre}
                </button>
              ))}
              {activeGenre && (
                <button 
                  onClick={() => setActiveGenre(null)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {rows.length > 0 ? (
          rows.map(row => (
            <ScrollRevealer key={row.id}>
              <ContentRow title={row.title} items={row.items} />
            </ScrollRevealer>
          ))
        ) : (
          <div className="px-6 md:px-12 py-20 text-center">
            <p className="text-white/20 font-black tracking-widest uppercase">No series found in this dimension</p>
          </div>
        )}
      </div>
    </div>
  );
}
