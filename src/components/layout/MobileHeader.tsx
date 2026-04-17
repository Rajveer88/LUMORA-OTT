import React from 'react';
import { Aperture, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileHeader() {
  const { openSearch } = useUI();
  const { currentUser } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-[100] flex items-center justify-between px-6 md:hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      
      <Link to="/" className="relative z-10 pointer-events-auto flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-lg flex items-center justify-center">
          <Aperture className="w-5 h-5 text-white animate-[spin_10s_linear_infinite]" />
        </div>
      </Link>

      <div className="flex items-center gap-2 relative z-10 pointer-events-auto">
        <button 
          onClick={openSearch}
          className="p-2 text-white/80 hover:text-white"
        >
          <Search className="w-6 h-6" />
        </button>
        <Link 
          to="/profile"
          className="p-2 text-white/80 hover:text-white"
        >
          <User className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
}
