import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  isMoodOpen: boolean;
  openMood: () => void;
  closeMood: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const openMood = () => setIsMoodOpen(true);
  const closeMood = () => setIsMoodOpen(false);

  return (
    <UIContext.Provider value={{ 
      isSearchOpen, openSearch, closeSearch,
      isMoodOpen, openMood, closeMood
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
