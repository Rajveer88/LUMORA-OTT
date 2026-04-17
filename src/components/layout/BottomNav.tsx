import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Search as SearchIcon, Plus, UserCircle, Tv } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion } from 'motion/react';
import { useUI } from '../../context/UIContext';

export default function BottomNav() {
  const location = useLocation();
  const { openSearch } = useUI();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: SearchIcon, label: 'Search', onClick: openSearch },
    { icon: Plus, label: 'Lists', path: '/watchlist' },
    { icon: UserCircle, label: 'Me', path: '/profile' },
  ];

  if (location.pathname.startsWith('/watch/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-theme/90 backdrop-blur-xl border-t border-glass-border flex items-center justify-around px-2 z-[100] md:hidden">
      {navItems.map((item) => {
        const isActive = item.path ? location.pathname === item.path : false;
        
        const Content = (
          <>
            <div className="relative">
              <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute -top-1 -right-1 w-1 h-1 bg-accent-cyan rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center">
              {item.label}
            </span>
          </>
        );

        if (item.onClick) {
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200",
                isActive ? "text-accent-cyan" : "text-text-dim"
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
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200",
              isActive ? "text-accent-cyan" : "text-text-dim"
            )}
          >
            {Content}
          </Link>
        );
      })}
    </nav>
  );
}
