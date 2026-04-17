import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CONTENT } from '../data/content';
import Watch from './Watch';
import { ChevronLeft, Share2, Info } from 'lucide-react';
import { cn } from '../utils/cn';
import { getTitleFontClass } from '../utils/typography';

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isTheaterMode, setIsTheaterMode] = useState(true);

  const content = MOCK_CONTENT.find(c => c.id === id);

  if (!content) return null;

  return (
    <div className="min-h-screen bg-bg-theme overflow-x-hidden">
      {/* Header bar for theater mode */}
      <header className="fixed top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-[100] flex items-center justify-between px-6 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className={cn(
               "text-white text-lg leading-tight",
               getTitleFontClass(content.genre)
            )}>{content.title}</h1>
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Now Playing</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(`/title/${content.id}`)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-0">
        <Watch 
          theaterModeOverride={isTheaterMode} 
          onToggleTheater={() => setIsTheaterMode(!isTheaterMode)} 
        />

        {/* Info section below player in theater mode */}
        {isTheaterMode && (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className={cn(
                    "text-4xl text-white mb-4",
                    getTitleFontClass(content.genre)
                  )}>{content.title}</h2>
                  <div className="flex items-center gap-4 text-white/40 text-sm font-bold tracking-widest uppercase">
                    <span>{content.year}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-accent-cyan">{content.rating} Rating</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{content.duration}</span>
                  </div>
                </div>

                <p className="text-lg text-white/70 leading-relaxed font-medium italic">
                  "{content.description}"
                </p>

                <div className="space-y-4">
                  <h3 className="text-white font-bold text-sm tracking-[2px] uppercase opacity-50">Cast</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.cast.map(c => (
                      <span key={c} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white text-sm font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <h3 className="text-white font-bold text-sm tracking-[2px] uppercase opacity-50">Intelligence Report</h3>
                  <p className="text-sm text-white/80 leading-[1.6]">
                    Our quantum analysis suggests a high atmospheric resonance with your viewing patterns. This title explores deep neural themes that align with your preference for <span className="text-accent-cyan font-bold">{content.genre[0]}</span> and <span className="text-accent-purple font-bold">{content.genre[1]}</span>.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-sm tracking-[2px] uppercase opacity-50">Director</h3>
                  <p className="text-xl font-black text-white">{content.director}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
