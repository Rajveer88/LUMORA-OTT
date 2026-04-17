import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { MOCK_CONTENT, Content, CATEGORIES } from '../data/content';

interface HistoryItem {
  contentId: string;
  progress: number;
  lastWatchedAt: string;
}

interface IntelligenceContextType {
  history: HistoryItem[];
  topGenres: string[];
  energyLevel: 'low' | 'neutral' | 'high';
  intelligentRows: any[];
  isLearning: boolean;
  scoreContent: (content: Content) => number;
}

const IntelligenceContext = createContext<IntelligenceContextType>({} as IntelligenceContextType);

export const useIntelligence = () => useContext(IntelligenceContext);

export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLearning, setIsLearning] = useState(true);

  // Energy Level based on time of day
  const energyLevel = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 6) return 'low'; // Late night
    if (hour >= 18) return 'neutral'; // Evening
    return 'high'; // Daytime
  }, []);

  // Listen to watch history
  useEffect(() => {
    if (!currentUser) {
      setHistory([]);
      setIsLearning(false);
      return; 
    }

    const q = query(
      collection(db, 'users', currentUser.uid, 'history'),
      orderBy('lastWatchedAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as HistoryItem);
      setHistory(items);
      
      // Simulate "Learning" delay for UX
      setTimeout(() => setIsLearning(false), 800);
    });

    return unsubscribe;
  }, [currentUser]);

  // Derived Intelligence
  const topGenres = useMemo(() => {
    const genreCounts: Record<string, number> = {};
    history.forEach(item => {
      const content = MOCK_CONTENT.find(c => c.id === item.contentId);
      content?.genre.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([genre]) => genre)
      .slice(0, 3);
  }, [history]);

  const scoreContent = useCallback((content: Content): number => {
    if (history.length === 0) return content.matchPercentage;
    
    // 1. Genre Affinity
    const watchedGenres = history.flatMap(h => {
      const c = MOCK_CONTENT.find(m => m.id === h.contentId);
      return c ? c.genre : [];
    });
    
    const genreFreq: Record<string, number> = {};
    watchedGenres.forEach(g => { genreFreq[g] = (genreFreq[g] || 0) + 1; });
    
    const frequencies = Object.values(genreFreq);
    const maxFreq = frequencies.length > 0 ? Math.max(...frequencies) : 1;
    
    const genreScore = content.genre.reduce((sum, g) => 
      sum + (genreFreq[g] || 0) / maxFreq, 0
    ) / Math.max(content.genre.length, 1);
    
    // 3. Novelty Bias (slight boost if not watched, slight dip if already watched)
    const alreadyWatched = history.some(h => h.contentId === content.id) ? -0.1 : 0.05;
    
    // Final Weighted Calculation (Genre is the primary factor now)
    const raw = (genreScore * 0.9) + alreadyWatched;
    
    // Normalize between 55% and 99% for UX
    return Math.min(Math.max(Math.round(raw * 100), 55), 99);
  }, [history]);

  const intelligentRows = useMemo(() => {
    const rows = [...CATEGORIES];
    
    // 1. Add "Continue Your Journey" if history exists
    const unfinished = history.filter(h => h.progress > 0).slice(0, 5);
    if (unfinished.length > 0) {
      rows.unshift({
        id: 'continue',
        title: 'Continue Your Journey',
        idList: unfinished.map(u => u.contentId)
      });
    }

    // 2. Add Genre-based recommendations
    topGenres.forEach(genre => {
      const recommendations = MOCK_CONTENT.filter(c => 
        c.genre.includes(genre) && !history.some(h => h.contentId === c.id)
      ).slice(0, 6);

      if (recommendations.length > 0) {
        rows.push({
          id: `rec-${genre}`,
          title: `Because you watched ${genre}`,
          idList: recommendations.map(c => c.id)
        });
      }
    });

    return rows.map(r => ({
      ...r,
      items: MOCK_CONTENT.filter(c => r.idList.includes(c.id))
    }));
  }, [history, topGenres]);

  return (
    <IntelligenceContext.Provider value={{
      history,
      topGenres,
      energyLevel,
      intelligentRows,
      isLearning,
      scoreContent
    }}>
      {children}
    </IntelligenceContext.Provider>
  );
};
