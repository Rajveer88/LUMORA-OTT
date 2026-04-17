import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, SlidersHorizontal, Film, Tv, LayoutGrid, ArrowLeft } from 'lucide-react';
import { MOCK_CONTENT } from '../../data/content';
import { useNavigate } from 'react-router-dom';
import ContentItem from '../ContentItem';
import { cn } from '../../utils/cn';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(MOCK_CONTENT);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) setQuery('');
  }, [isOpen]);

  useEffect(() => {
    const filtered = MOCK_CONTENT.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.genre.some(g => g.toLowerCase().includes(query.toLowerCase())) ||
      item.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    );
    setResults(filtered);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] bg-[#050507]/95 backdrop-blur-2xl flex flex-col"
        >
          {/* Header */}
          <header className="h-16 md:h-20 border-b border-glass-border flex items-center px-4 md:px-8 gap-4">
             <button onClick={onClose} className="p-2 text-white/60 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
             </button>
             
             <div className="flex-1 relative">
                <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-cyan" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Titles, people, genres..."
                  className="w-full bg-transparent border-none outline-none text-white text-lg md:text-xl px-8 placeholder:text-white/20"
                />
             </div>

             {query && (
               <button onClick={() => setQuery('')} className="p-2 text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
               </button>
             )}
          </header>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scrollbar-none no-scrollbar">
            <div className="max-w-7xl mx-auto">
              {query && (
                <div className="mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[2px] text-white/40">Searching for "{query}"</h3>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {results.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => {
                        onClose();
                        navigate(`/title/${item.id}`);
                    }}
                  >
                    <ContentItem item={item} className="w-full" />
                  </motion.div>
                ))}
              </div>

              {results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                   <p className="text-white/20 font-black tracking-widest uppercase">No results found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
