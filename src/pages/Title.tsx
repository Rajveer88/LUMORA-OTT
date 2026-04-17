import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_CONTENT } from '../data/content';
import { 
  Play, 
  Plus, 
  Check,
  Share2, 
  Download, 
  Star, 
  ChevronDown, 
  Sparkles,
  Info,
  Clock,
  Calendar,
  Layers,
  Cpu,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useIntelligence } from '../context/IntelligenceContext';
import { streamIntelligenceReport } from '../lib/gemini';
import ContentRow from '../components/ContentRow';
import DownloadButton from '../components/DownloadButton';
import { cn } from '../utils/cn';
import { getTitleFontClass } from '../utils/typography';
import { LumoraOriginalBadge } from '../components/ui/LumoraOriginalBadge';

export default function Title() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { watchlistIds, addToWatchlist, removeFromWatchlist, currentUser } = useAuth();
  const { topGenres, scoreContent } = useIntelligence();
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const item = MOCK_CONTENT.find(c => c.id === id);
  const isInWatchlist = watchlistIds.has(item?.id || '');

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSeasonMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!item) return;
    
    setReportLoading(true);
    setReportText('');
    
    let isMounted = true;
    const loadReport = async () => {
      const generator = streamIntelligenceReport(
        item.title,
        item.genre,
        item.description,
        topGenres
      );

      for await (const chunk of generator) {
        if (!isMounted) break;
        setReportLoading(false);
        setReportText(prev => prev + chunk);
      }
    };

    loadReport();
    return () => { isMounted = false; };
  }, [id, item, topGenres]);

  if (!item) return null;

  const toggleWatchlist = async () => {
    if (!currentUser) return navigate('/login');
    if (isInWatchlist) {
      await removeFromWatchlist(item.id);
    } else {
      await addToWatchlist(item.id);
    }
  };

  const similarItems = MOCK_CONTENT.filter(c => 
    c.id !== item.id && c.genre.some(g => item.genre.includes(g))
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-bg-theme pb-32">
      {/* Hero Header */}
      <div className="relative h-[85vh] overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={item.backdropUrl} 
            className="w-full h-full object-cover origin-center scale-105"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-theme via-bg-theme/40 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg-theme/80 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-6 md:px-12 pb-20">
          <div className="max-w-4xl space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-[3px]"
            >
              {(item.isOriginal || item.studio === 'LUMORA Studios') && (
                <>
                  <LumoraOriginalBadge size="sm" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </>
              )}
              <span className="text-white/60">4K HDR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-white/60">DOLBY ATMOS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-accent-purple">QUANTUM SOUND</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-6xl md:text-8xl lg:text-9xl text-white leading-[0.85] mb-2",
                getTitleFontClass(item.genre)
              )}
              style={{ textShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.1)" }}
            >
              {item.title}
            </motion.h1>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="flex flex-wrap items-center gap-6"
            >
              <div className="flex items-center gap-2">
                 <div className="text-accent-cyan text-4xl font-black italic">
                   {scoreContent(item)}%
                 </div>
                 <div className="text-[10px] font-black text-white/40 leading-none uppercase tracking-widest">
                   Neural<br/>Resonance
                 </div>
              </div>

              <div className="h-10 w-[1px] bg-white/10" />

              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-3 text-white/60 text-sm font-bold uppercase tracking-widest">
                   <span>{item.year}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                   <span>{item.rating}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                   <span>{item.duration}</span>
                 </div>
                 <div className="flex gap-2">
                    {item.genre.map(g => (
                      <span key={g} className="text-[10px] text-accent-cyan/80 font-black uppercase tracking-[2px]">{g}</span>
                    ))}
                 </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-wrap items-center gap-4"
            >
              <Link
                to={`/watch/${item.id}`}
                className="h-16 px-10 bg-white text-black rounded-2xl flex items-center gap-3 font-black uppercase tracking-[3px] text-sm hover:scale-105 transition-transform active:scale-95 group shadow-2xl"
              >
                <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
                Synch Now
              </Link>
              
              <button 
                onClick={toggleWatchlist}
                className="h-16 px-8 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-3xl rounded-2xl flex items-center gap-3 font-black uppercase tracking-[3px] text-sm text-white transition-all active:scale-95"
              >
                {isInWatchlist ? (
                   <>
                     <Check className="w-5 h-5 text-accent-cyan" />
                     Saved
                   </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    My List
                  </>
                )}
              </button>

              <DownloadButton size="lg" />

              <button className="h-16 w-16 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-3xl rounded-2xl flex items-center justify-center text-white transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-16 -mt-10 relative z-20">
        <div className="lg:col-span-2 space-y-12">
           <div className="space-y-6">
              <h2 className="text-white/40 font-black uppercase tracking-[4px] text-sm flex items-center gap-3">
                 <Info className="w-4 h-4" />
                 Transmitted Narrative
              </h2>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-black uppercase italic tracking-tighter">
                "{item.description}"
              </p>
           </div>

           {/* Cast */}
           <div className="space-y-6">
              <h3 className="text-white/40 font-black uppercase tracking-[4px] text-sm flex items-center gap-3">
                 <User className="w-4 h-4" />
                 Neural Pattern Nodes
              </h3>
              <div className="flex flex-wrap gap-3">
                 {item.cast.map(c => (
                   <span 
                    key={c}
                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm hover:bg-white/10 transition-colors cursor-default"
                   >
                     {c}
                   </span>
                 ))}
              </div>
           </div>

           {/* Episodes/Seasons for series */}
           {item.type === 'series' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-white/40 font-black uppercase tracking-[4px] text-sm">Sequence Modules</h3>
                   <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setSeasonMenuOpen(!seasonMenuOpen)}
                        className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-lg"
                      >
                        Season 1
                        <ChevronDown className={cn("w-5 h-5 transition-transform", seasonMenuOpen && "rotate-180")} />
                      </button>
                      
                      <AnimatePresence>
                        {seasonMenuOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-full mt-4 w-48 bg-[#14141c] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                          >
                            {[1, 2, 3].map(s => (
                              <button 
                                key={s}
                                onClick={() => setSeasonMenuOpen(false)}
                                className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-colors text-white font-bold opacity-60 hover:opacity-100"
                              >
                                Season {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3, 4].map((ep) => (
                    <Link 
                      to={`/watch/${item.id}`}
                      key={ep} 
                      className="group flex gap-6 p-6 bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 rounded-3xl transition-all items-center"
                    >
                      <div className="text-white/20 font-black text-2xl italic w-8 shrink-0">0{ep}</div>
                      <div className="w-40 aspect-video rounded-xl bg-[#0c0c0f] shrink-0 relative overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/${item.id}_ep${ep}/400/225`} 
                          alt="" 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Play className="w-8 h-8 text-white fill-current" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-black uppercase tracking-tight text-xl mb-1 group-hover:text-accent-cyan transition-colors italic">Module Alpha {ep}</h4>
                        <p className="text-white/40 text-[10px] font-bold tracking-widest leading-relaxed line-clamp-2 uppercase">Initial data stream synchronization. Establishing high-frequency neural link through cinematic resonance.</p>
                      </div>
                      <div className="text-white/20 font-black text-xs shrink-0 tracking-widest">48M</div>
                    </Link>
                  ))}
                </div>
             </div>
           )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-12">
            {/* Intelligence Report - Streaming Component */}
            <div className="relative group p-[1px] rounded-[40px] bg-gradient-to-br from-accent-purple/30 to-accent-cyan/30">
               <div className="relative bg-[#0c0c0f] rounded-[39px] p-8 space-y-6 overflow-hidden bg-clip-padding backdrop-blur-3xl">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-accent-cyan">
                        <Cpu className="w-5 h-5" />
                     </div>
                     <h3 className="text-white font-black uppercase tracking-[3px] text-sm">Intelligence Report</h3>
                  </div>
                  
                  <div className="space-y-4 relative">
                    <div className="text-white/90 text-lg leading-[1.6] font-black uppercase italic tracking-tighter min-h-[120px]">
                      {reportLoading ? (
                        <div className="space-y-3 opacity-20">
                           <div className="h-4 w-full bg-white rounded-full animate-pulse" />
                           <div className="h-4 w-[90%] bg-white rounded-full animate-pulse" />
                           <div className="h-4 w-[40%] bg-white rounded-full animate-pulse" />
                        </div>
                      ) : (
                        <>
                          {reportText}
                          <motion.span 
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-2.5 h-6 bg-accent-cyan ml-1 align-middle"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Director</p>
                        <p className="text-white font-black uppercase italic tracking-tighter">{item.director}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Complexity</p>
                        <p className="text-white font-black uppercase italic tracking-tighter">High Tier</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-8">
               <h3 className="text-white/40 font-black uppercase tracking-[4px] text-[10px]">Aesthetic Parameters</h3>
               <div className="space-y-6">
                  <div className="flex items-center gap-5 group">
                     <Calendar className="w-5 h-5 text-white/20 group-hover:text-accent-cyan transition-colors" />
                     <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Archive Date</p>
                        <p className="text-white font-black uppercase italic tracking-tighter text-lg leading-none">{item.year}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                     <Clock className="w-5 h-5 text-white/20 group-hover:text-accent-purple transition-colors" />
                     <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Duration Sequence</p>
                        <p className="text-white font-black uppercase italic tracking-tighter text-lg leading-none">{item.duration}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                     <Layers className="w-5 h-5 text-white/20 group-hover:text-yellow-500 transition-colors" />
                     <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Visual Standard</p>
                        <p className="text-white font-black uppercase italic tracking-tighter text-lg leading-none">Quantum HDR</p>
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* Suggested Content */}
      <div className="mt-32">
        <ContentRow title="Similar Resonances" items={similarItems} />
      </div>
    </div>
  );
}
