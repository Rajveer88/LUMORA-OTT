import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, User as UserIcon, LogOut, Aperture, Tv, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { userProfile, loginWithGoogle, logout, currentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show full navbar on video watch page
  if (location.pathname.startsWith('/watch/')) {
    return null;
  }

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-6 md:px-12 py-4 flex items-center justify-between",
        isScrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="flex items-center gap-12">
        <Link to="/" className="flex items-center gap-3 xl:gap-4 group">
          <div className="relative w-10 h-10 bg-gradient-to-br from-[#9D00FF] to-[#00F0FF] rounded-xl shadow-[0_0_20px_rgba(157,0,255,0.4)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-[1.5px] bg-[rgba(10,10,12,0.9)] rounded-[10.5px] z-0" />
            <Aperture className="w-6 h-6 text-white z-10 relative drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-[spin_10s_linear_infinite]" />
          </div>
          <span className="text-[20px] font-extrabold tracking-[-1px] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 hidden sm:block uppercase">
            LUMORA
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-wide">
          <Link to="/" className={cn("transition-colors hover:text-white", location.pathname === '/' ? 'text-accent-cyan' : 'text-text-dim')}>Home</Link>
          <Link to="/movies" className="text-text-dim transition-colors hover:text-white">Movies</Link>
          <Link to="/series" className="text-text-dim transition-colors hover:text-white">Series</Link>
          {currentUser && <Link to="/watchlist" className={cn("transition-colors hover:text-white", location.pathname === '/watchlist' ? 'text-accent-cyan' : 'text-text-dim')}>My List</Link>}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/search" className="text-text-dim hover:text-white transition-colors bg-glass border border-glass-border rounded-full w-9 h-9 flex justify-center items-center">
          <Search className="w-[18px] h-[18px]" />
        </Link>
        <button className="text-text-dim hover:text-white transition-colors bg-glass border border-glass-border rounded-full w-9 h-9 flex justify-center items-center">
          <Bell className="w-[18px] h-[18px]" />
        </button>
        
        {currentUser ? (
          <div className="group relative">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
            
            <div className="absolute right-0 mt-2 w-48 py-2 bg-[#0a0a0c] border border-glass-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right transform scale-95 group-hover:scale-100">
              <div className="px-4 py-2 border-b border-glass-border">
                <p className="text-sm font-bold text-white truncate">{userProfile?.name}</p>
                <p className="text-xs text-white/50 truncate">{currentUser.email}</p>
              </div>
              
              <Link
                to="/profile"
                className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-2 mt-1 transition-colors"
               >
                 <Settings className="w-4 h-4" />
                 Settings
               </Link>

              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
