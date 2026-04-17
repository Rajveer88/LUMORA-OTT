import React from 'react';

export const SkeletonHero = () => (
  <div className="relative w-full h-[85vh] lg:h-[95vh] overflow-hidden bg-[#0a0a0f] flex items-end">
    <div className="absolute inset-0 z-0 bg-[#0a0a0f]" />
    <div className="relative z-20 px-6 md:px-12 pb-24 md:pb-32 w-full max-w-4xl space-y-6">
      <div className="space-y-4">
        <div className="h-6 w-32 rounded-md skeleton" />
        <div className="h-20 w-3/4 rounded-xl skeleton" />
        <div className="h-4 w-1/2 rounded-md skeleton" />
      </div>
      <div className="flex gap-3">
        <div className="h-12 w-40 rounded-xl skeleton" />
        <div className="h-12 w-40 rounded-xl skeleton" />
      </div>
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="mb-12">
    <div className="px-6 md:px-12 mb-6">
      <div className="h-5 w-48 rounded skeleton" />
    </div>
    <div className="flex gap-4 px-6 md:px-12 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="flex-none w-[196px] sm:w-[220px] lg:w-[240px] aspect-[16/9] rounded-xl skeleton border border-white/5" 
        />
      ))}
    </div>
  </div>
);

export const SkeletonPage = () => (
  <div className="min-h-screen bg-bg-theme">
    <SkeletonHero />
    <div className="relative z-30 -mt-24 pb-24 space-y-12">
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  </div>
);
