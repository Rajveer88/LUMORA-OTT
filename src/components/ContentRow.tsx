import React, { useRef } from 'react';
import ContentItem from './ContentItem';
import { Content } from '../data/content';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface ContentRowProps {
  key?: React.Key;
  title: string;
  items: Content[];
  isHighlighted?: boolean;
}

export default function ContentRow({ title, items, isHighlighted }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScrollEvent = () => {
    if (rowRef.current) {
      setIsScrolled(rowRef.current.scrollLeft > 0);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={cn("relative mb-12 pl-6 md:pl-12 group", isHighlighted && "py-4 bg-accent-cyan/5 border-y border-accent-cyan/10")}>
      <h2 className={cn("text-[18px] md:text-[22px] font-bold text-white mb-4 tracking-[-0.5px]", isHighlighted && "text-accent-cyan")}>
        {title}
      </h2>
      
      <div className="relative">
        {isScrolled && (
          <button 
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-0 bottom-0 w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center z-40 backdrop-blur-sm -ml-6 md:-ml-12 hover:bg-black/80"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        <div 
          ref={rowRef}
          onScroll={handleScrollEvent}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-8 pt-4 px-1 snap-x snap-mandatory md:snap-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div key={item.id} className="snap-start">
              <ContentItem item={item} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-0 w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center z-40 backdrop-blur-sm hover:bg-black/80"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
