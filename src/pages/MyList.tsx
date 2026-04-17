import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_CONTENT } from '../data/content';
import ContentItem from '../components/ContentItem';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';

export default function MyList() {
  const { currentUser, watchlistIds, loading } = useAuth();
  
  // High efficiency filtering from localized context
  const savedItems = MOCK_CONTENT.filter(c => watchlistIds.has(c.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-theme pt-32 px-6 flex items-center justify-center">
        <div className="text-white/20 font-black uppercase tracking-[4px] animate-pulse italic">Synchronizing Archive...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-bg-theme pt-32 px-6 flex items-center justify-center">
         <div className="text-center space-y-6">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Nexus Link Required</h1>
            <p className="text-white/40 max-w-xs mx-auto text-sm font-bold uppercase tracking-widest">Identify yourself to access your personal cinematic stash.</p>
            <Link to="/login" className="inline-block bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[3px] text-xs hover:scale-105 transition-transform">Link Personal Identity</Link>
         </div>
      </div>
    );
  }

  const continueWatching = savedItems.length > 0 ? savedItems[0] : null;

  return (
    <div className="min-h-screen bg-bg-theme pt-24 md:pt-32 px-4 md:px-12 text-white pb-24 md:pb-32">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 md:mb-12">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-4px] md:tracking-[-6px] text-white uppercase italic">My List</h1>
          <p className="text-[10px] md:text-[12px] text-white/30 uppercase tracking-[4px] mt-2 font-black italic">Archived records curated for your aesthetic resonance</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Main Content Area */}
          <div className="flex-1">
            {continueWatching && (
              <div className="mb-12 md:mb-20">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                   <div className="w-12 md:w-20 h-[1px] bg-accent-purple" />
                   <h2 className="text-[11px] font-black text-white/50 uppercase tracking-[3px] italic">Priority Sequence</h2>
                </div>
                
                <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[40px] overflow-hidden group border border-white/10 shadow-2xl">
                  <img 
                    src={continueWatching.backdropUrl || `https://picsum.photos/seed/${continueWatching.id}/1200/600`} 
                    className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-theme via-bg-theme/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-accent-cyan/20 border border-accent-cyan/30 px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded-lg text-accent-cyan backdrop-blur-3xl">4k Ultra HD</span>
                      <span className="text-[10px] text-white/40 font-black tracking-[2px] uppercase">{continueWatching.type === 'series' ? 'S2 : E4' : 'MOVIE'} • 12m Remaining</span>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter">{continueWatching.title}</h3>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                       <div className="h-full bg-accent-purple shadow-[0_0_20px_var(--color-accent-purple)]" style={{ width: '65%' }} />
                    </div>
                  </div>
                  
                  <Link to={`/watch/${continueWatching.id}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                     <Play className="w-8 h-8 fill-current ml-1" />
                  </Link>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-8 md:mb-12">
                <div className="flex items-center gap-4">
                   <div className="w-12 md:w-20 h-[1px] bg-accent-cyan" />
                   <h2 className="text-[11px] font-black text-white/50 uppercase tracking-[3px] italic">Deep Archive</h2>
                </div>
                <span className="text-[10px] md:text-[12px] text-white/20 tracking-[4px] font-black uppercase">{savedItems.length} Fragments</span>
              </div>
              
              {savedItems.length === 0 ? (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-[40px] p-24 text-center">
                  <p className="text-white/20 text-sm font-black uppercase tracking-[4px] italic max-w-sm mx-auto leading-relaxed">Your neural archive is currently empty. Begin the harvesting process in the digital library.</p>
                  <Link to="/" className="inline-block mt-8 text-accent-cyan font-black uppercase tracking-[2px] text-xs border-b border-accent-cyan/40 pb-1">Start Harvesting</Link>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  {savedItems.map(item => (
                    <div key={item.id} className="w-full">
                       <ContentItem item={item} className="w-full" />
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Sidebar Area */}
          <div className="w-full lg:w-[350px] shrink-0">
             <div className="bg-[#14141c]/40 border border-white/5 rounded-[40px] p-8 lg:sticky lg:top-32 shadow-2xl backdrop-blur-3xl">
                <h3 className="text-[11px] text-white/40 font-black uppercase tracking-[4px] mb-8 italic">New Resonances</h3>
                
                <div className="space-y-6">
                  {MOCK_CONTENT.slice(0, 4).filter(m => !watchlistIds.has(m.id)).slice(0, 3).map(item => (
                    <Link to={`/title/${item.id}`} key={item.id} className="flex gap-6 group items-center">
                       <div className="w-20 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 group-hover:border-accent-cyan transition-all shadow-xl group-hover:scale-105 shrink-0">
                          <img 
                            src={item.posterUrl || item.backdropUrl} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                            referrerPolicy="no-referrer"
                            alt=""
                          />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-black text-white group-hover:text-accent-cyan transition-colors line-clamp-1 uppercase italic tracking-tighter">{item.title}</h4>
                          <p className="text-[9px] text-white/30 uppercase tracking-[2px] font-black mt-1 italic">{item.type} • {item.genre[0]}</p>
                       </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5">
                   <div className="p-6 bg-accent-purple/5 border border-accent-purple/10 rounded-3xl">
                      <p className="text-[10px] text-white/50 leading-relaxed font-black uppercase tracking-widest text-center">Your neural preference filter is currently active. Showing only high-resonance matches.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
        
        <div className="mt-32 text-center pb-12">
            <div className="w-12 h-12 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-white/5 opacity-40">
               <span className="text-[10px] text-white/40 font-black">LUM</span>
            </div>
            <p className="text-[11px] uppercase tracking-[4px] text-white/20 font-black italic">Terminal Sequence Reached</p>
        </div>
      </div>
    </div>
  );
}
