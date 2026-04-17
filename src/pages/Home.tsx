import React from 'react';
import Hero from '../components/Hero';
import ContentRow from '../components/ContentRow';
import ScrollRevealer from '../components/ScrollRevealer';
import { MOCK_CONTENT, Content } from '../data/content';
import { useAuth } from '../context/AuthContext';
import { useIntelligence } from '../context/IntelligenceContext';
import { SkeletonPage } from '../components/Skeletons';

export default function Home() {
  const { currentUser } = useAuth();
  const { intelligentRows, isLearning, history } = useIntelligence();

  const featuredItems = React.useMemo(() => {
    return [...MOCK_CONTENT]
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5);
  }, []);

  if (isLearning) {
    return <SkeletonPage />;
  }

  const continueWatchingItems = history.map(h => MOCK_CONTENT.find(c => c.id === h.contentId)).filter(Boolean) as Content[];

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-24 overflow-x-hidden">
      <Hero featuredContent={featuredItems} />
      
      <div className="relative z-30 -mt-24 md:-mt-32 pb-24">
        {/* Continue Watching Rail (Always First) */}
        {continueWatchingItems.length > 0 && (
          <div className="mb-8">
            <ScrollRevealer>
              <ContentRow 
                title="Continue Your Journey" 
                items={continueWatchingItems} 
              />
            </ScrollRevealer>
          </div>
        )}

        {intelligentRows.map(row => {
          if (row.id === 'continue') return null;
          return (
            <ScrollRevealer key={row.id}>
              <ContentRow title={row.title} items={row.items} />
            </ScrollRevealer>
          );
        })}
      </div>
    </div>
  );
}
