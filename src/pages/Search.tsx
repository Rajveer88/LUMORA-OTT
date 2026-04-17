import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MOCK_CONTENT, Content } from '../data/content';
import ContentItem from '../components/ContentItem';
import { Search as SearchIcon, X, SlidersHorizontal, Film, Tv, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

const GENRES = ['All', 'Sci-Fi', 'Drama', 'Thriller', 'Fantasy', 'Action', 'Animation', 'Comedy'];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const activeGenre = searchParams.get('genre') || 'All';
  const activeType = (searchParams.get('type') as 'all' | 'movie' | 'series') || 'all';

  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(prev => {
        if (!localQuery) prev.delete('q');
        else prev.set('q', localQuery);
        return prev;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchParams]);

  const results = useMemo(() => {
    return MOCK_CONTENT.filter(item => {
      const matchQuery = !query || 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      
      const matchGenre = activeGenre === 'All' || item.genre.includes(activeGenre);
      const matchType = activeType === 'all' || item.type === activeType;

      return matchQuery && matchGenre && matchType;
    });
  }, [query, activeGenre, activeType]);

  const clearFilters = () => {
    setSearchParams({});
    setLocalQuery('');
  };

  return (
    <div className="min-h-screen bg-[#050507] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar Block */}
        <div className="relative mb-12">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent-cyan transition-colors">
            <SearchIcon className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search by title, genre, or director..."
            className="w-full h-20 bg-white/5 border-b-2 border-white/10 text-2xl md:text-4xl font-black text-white px-16 outline-none focus:border-accent-cyan transition-all placeholder:text-white/10"
          />
          {localQuery && (
            <button 
              onClick={() => setLocalQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            <div className="flex gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSearchParams(prev => {
                    if (genre === 'All') prev.delete('genre');
                    else prev.set('genre', genre);
                    return prev;
                  })}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                    activeGenre === genre 
                      ? "bg-accent-cyan border-accent-cyan text-black" 
                      : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl shrink-0">
            {[
              { id: 'all', icon: LayoutGrid },
              { id: 'movie', icon: Film },
              { id: 'series', icon: Tv }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSearchParams(prev => {
                  if (type.id === 'all') prev.delete('type');
                  else prev.set('type', type.id);
                  return prev;
                })}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  activeType === type.id ? "bg-white text-black" : "text-white/40 hover:text-white"
                )}
              >
                <type.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-10 flex items-center justify-between">
           <h3 className="text-[12px] font-black uppercase tracking-[3px] text-white/40">
             Showing {results.length} Results {query && `for "${query}"`}
           </h3>
           {(query || activeGenre !== 'All' || activeType !== 'all') && (
             <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-accent-purple hover:text-white transition-colors">
               Reset Sensors
             </button>
           )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {results.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.04,
                  ease: [0.16, 1, 0.3, 1] 
                }}
              >
                <ContentItem item={item} className="w-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8">
               <SlidersHorizontal className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">No entities found</h2>
            <p className="text-white/40 text-sm max-w-xs mx-auto mb-10">We couldn't locate any stories matching those parameters. Adjust your frequency filters or try a broader prompt.</p>
            <button
              onClick={clearFilters}
              className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
            >
              Clear Frequency
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
