import React from 'react';
import { Content } from '../data/content';
import { Play, Plus, Info, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useIntelligence } from '../context/IntelligenceContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';
import { getTitleFontClass } from '../utils/typography';

interface ContentItemProps {
  key?: React.Key;
  item: Content;
  className?: string;
}

export default function ContentItem({ item, className }: ContentItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const { watchlistIds, addToWatchlist, removeFromWatchlist, currentUser } = useAuth();
  const { scoreContent } = useIntelligence();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isInWatchlist = watchlistIds.has(item.id);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return navigate('/login');

    if (isInWatchlist) {
      await removeFromWatchlist(item.id);
      showToast(`Removed from My List`, 'info');
    } else {
      await addToWatchlist(item.id);
      showToast(`${item.title} added to My List`, 'success');
    }
  };

  const handleClick = () => {
    navigate(`/title/${item.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };

  const currentScore = scoreContent(item);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${item.title}`}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      className={cn(
        "relative flex-none aspect-[16/9] rounded-2xl cursor-pointer group origin-center transition-all duration-300 content-card focus-visible:ring-2 focus-visible:ring-accent-cyan outline-none",
        className || "w-[240px] sm:w-[260px] md:w-[240px] lg:w-[280px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      style={{ zIndex: isHovered ? 50 : 1 }}
    >
      <motion.div
        className={cn(
          "w-full h-full rounded-2xl border border-white/5 bg-[#14141c]/60 overflow-hidden transition-all duration-300",
          isHovered ? "md:shadow-[0_0_30px_rgba(0,240,255,0.2)] md:border-accent-cyan/40 md:scale-105" : ""
        )}
        whileHover={{ 
          rotateY: window.innerWidth > 768 ? 5 : 0,
          rotateX: window.innerWidth > 768 ? -2 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a24] to-[#0f0f15] flex flex-col items-center justify-center p-4 text-center">
            <span className="text-accent-cyan/40 mb-2">
              <Play className="w-8 h-8 fill-current opacity-20" />
            </span>
            <span className="text-white/40 font-bold text-[14px] leading-tight break-words line-clamp-3">
              {item.title}
            </span>
          </div>
        ) : (
          <img
            src={item.backdropUrl || `https://picsum.photos/seed/${item.id}/800/450`}
            alt={item.title}
            className="w-full h-full object-cover opacity-80 md:opacity-70 transition-all duration-300 group-hover:opacity-100"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        )}
        
        <div 
          className={cn(
            "absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300",
            isHovered ? "md:opacity-0" : "opacity-100"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1 h-3 rounded-full" style={{ backgroundColor: item.accentColor }} />
             <h3 className={cn(
               "text-white text-[13px] md:text-[12px] truncate",
               getTitleFontClass(item.genre)
             )}>{item.title}</h3>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-text-dim text-[10px] uppercase font-bold tracking-widest">{item.genre[0]} &bull; {item.duration}</div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isHovered && window.innerWidth > 768 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1.1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute -inset-4 p-4 bg-[rgba(20,20,28,0.98)] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-glass-border z-[101] flex flex-col justify-end overflow-hidden isolation-auto hidden md:flex"
            style={{ 
              backgroundImage: `linear-gradient(to top, rgba(20,20,28,1) 30%, transparent 100%), url(${item.backdropUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'top',
              isolation: 'isolate'
            }}
          >
            <div className="flex gap-2 mb-3 relative z-10">
              <Link 
                to={`/watch/${item.id}`} 
                aria-label={`Play ${item.title}`}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <Play className="w-4 h-4 text-black fill-current ml-0.5" />
              </Link>
              <button 
                onClick={toggleWatchlist} 
                aria-label={isInWatchlist ? "Remove from My List" : "Add to My List"}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white backdrop-blur-md shadow-lg"
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
              <Link 
                to={`/title/${item.id}`} 
                aria-label={`View more info for ${item.title}`}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white ml-auto backdrop-blur-md shadow-lg"
              >
                <Info className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative z-10">
              <h4 className={cn(
                "text-white text-[15px] mb-1.5 leading-tight",
                getTitleFontClass(item.genre)
              )}>{item.title}</h4>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-wider uppercase mb-2">
                <span style={{ color: item.accentColor }}>{currentScore}% Match</span>
                <span className="text-white/60">{item.year}</span>
                {item.seasons && <span className="text-accent-purple font-black">{item.seasons} Seasons</span>}
                <span className="bg-white/10 px-1 py-0.5 rounded text-[8px] text-white/80 border border-white/10">{item.rating}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/60 font-medium">
                {item.genre.slice(0, 3).map((g, i) => (
                  <React.Fragment key={g}>
                    <span>{g}</span>
                    {i < Math.min(item.genre.length, 3) - 1 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            <div 
              className="absolute top-2 right-2 border border-accent-cyan/30 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase"
              style={{ backgroundColor: `${item.accentColor}22`, color: item.accentColor, borderColor: `${item.accentColor}55` }}
            >
               Predicted for you
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
