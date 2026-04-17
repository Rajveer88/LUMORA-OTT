import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Film, 
  Tv, 
  Plus, 
  Search, 
  User, 
  LogOut,
  Aperture,
  Settings,
  HelpCircle,
  TrendingUp,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { cn } from '../../utils/cn';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();
  const { openSearch } = useUI();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', onClick: openSearch },
    { icon: TrendingUp, label: 'Trending', path: '/trending', badge: 'New' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: Tv, label: 'Series', path: '/series' },
    { icon: Plus, label: 'My List', path: '/watchlist', authRequired: true },
    { icon: UserCircle, label: 'Profile', path: '/profile', authRequired: true },
  ];

  if (location.pathname.startsWith('/watch/')) return null;

  return (
    <motion.aside
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      role="navigation"
      aria-label="Main Navigation"
      className={cn(
        "fixed left-0 top-0 h-full z-[100] bg-[rgba(10,10,12,0.85)] border-r border-glass-border transition-all duration-300 ease-out backdrop-blur-xl hidden md:flex flex-col items-center py-8",
        isExpanded ? "w-64 px-6 items-start" : "w-16 md:w-20"
      )}
    >
      {/* Brand Logo */}
      <Link to="/" className="mb-12 flex items-center gap-4 focus-visible:outline-accent-cyan rounded-lg" aria-label="LUMORA Home">
        <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 bg-gradient-to-br from-[#9D00FF] to-[#00F0FF] rounded-xl shadow-[0_0_20px_rgba(157,0,255,0.4)] flex items-center justify-center overflow-hidden">
           <div className="absolute inset-[1px] bg-[rgba(10,10,12,0.9)] rounded-[10.5px] z-0" />
           <Aperture className="w-5 h-5 text-white z-10 relative animate-[spin_10s_linear_infinite]" />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-xl font-extrabold tracking-[-1px] uppercase text-white"
            >
              LUMORA
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Main Nav Items */}
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item) => {
          if (item.authRequired && !currentUser) return null;
          const isActive = item.path ? location.pathname === item.path : false;
          
          const Content = (
            <>
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive && "text-accent-cyan")} />
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 truncate flex-1 font-medium text-sm flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-accent-purple text-[8px] uppercase px-1.5 py-0.5 rounded font-bold">{item.badge}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.div 
                  layoutId="activePip" 
                  className={cn(
                    "absolute h-6 bg-accent-cyan rounded-full transition-all",
                    isExpanded ? "-left-1 w-1.5" : "left-0 w-1"
                  )} 
                />
              )}
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  "group relative flex items-center h-12 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan",
                  isExpanded ? "px-4 w-full" : "justify-center w-full",
                  isActive ? "bg-white/10 text-accent-cyan" : "text-text-dim hover:bg-white/5 hover:text-white"
                )}
              >
                {Content}
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path!}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "group relative flex items-center h-12 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan",
                isExpanded ? "px-4 w-full" : "justify-center w-full",
                isActive ? "bg-white/10 text-accent-cyan" : "text-text-dim hover:bg-white/5 hover:text-white"
              )}
            >
              {Content}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Settings (Bottom) */}
      <div className="w-full space-y-2 pt-8 border-t border-glass-border">
          {currentUser ? (
            <div className="space-y-2 flex flex-col items-center">
              <Link 
                to="/profile"
                className={cn(
                  "flex items-center rounded-xl overflow-hidden",
                  isExpanded ? "px-4 py-2 w-full border border-transparent hover:bg-white/5 transition-all" : "justify-center h-12"
                )}
              >
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan p-[2px] shrink-0">
                    <div className="w-full h-full rounded-full bg-bg-theme flex items-center justify-center overflow-hidden">
                       <span className="text-[10px] font-black text-white uppercase">{userProfile?.name?.charAt(0) || 'U'}</span>
                    </div>
                 </div>
                 {isExpanded && (
                   <div className="ml-3 overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{userProfile?.name?.split(' ')[0]}</p>
                   </div>
                 )}
              </Link>
              
              <div className="w-full">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={cn(
                    "group flex items-center h-12 rounded-xl text-text-dim hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan cursor-pointer",
                    isExpanded ? "px-4 w-full" : "justify-center w-full"
                  )}>
                  <Settings className="w-5 h-5 shrink-0" />
                  {isExpanded && <span className="ml-4 text-sm font-medium">Settings</span>}
                </button>
                
                <AnimatePresence>
                  {isSettingsOpen && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[#14141c]/50 rounded-xl mt-2 mx-2"
                    >
                      <button 
                        onClick={logout}
                        className="flex items-center h-10 w-full px-4 text-red-500 hover:bg-white/5 transition-all outline-none"
                        aria-label="Logout"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span className="ml-3 text-xs font-medium">Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link 
              to="/login"
              className={cn(
                "flex items-center h-12 rounded-xl text-accent-cyan hover:bg-white/5 transition-all font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan",
                isExpanded ? "px-4 w-full" : "justify-center w-full"
              )}
            >
              <User className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="ml-4 text-sm">Sign In</span>}
            </Link>
          )}
      </div>
    </motion.aside>
  );
}
