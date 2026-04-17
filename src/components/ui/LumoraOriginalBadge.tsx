import React from 'react';
import { cn } from '../../utils/cn';

interface LumoraOriginalBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LumoraOriginalBadge({ className, size = 'md' }: LumoraOriginalBadgeProps) {
  const sizeClasses = {
    sm: {
      lumora: 'text-[10px] tracking-[2px]',
      originals: 'text-[14px] -mt-1',
    },
    md: {
      lumora: 'text-[14px] tracking-[3px]',
      originals: 'text-[22px] -mt-1.5',
    },
    lg: {
      lumora: 'text-[20px] tracking-[4px]',
      originals: 'text-[32px] -mt-2',
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center select-none", className)}>
      <div 
        className={cn(
          "font-sans font-bold text-white uppercase leading-none z-10",
          sizeClasses[size].lumora
        )}
        style={{
          textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.4)',
        }}
      >
        LUMORA
      </div>
      <div 
        className={cn(
          "font-caveat text-[#c87bff] leading-none z-20 relative",
          sizeClasses[size].originals
        )}
        style={{
          textShadow: '0 2px 10px rgba(0,0,0,0.6), 0 0 15px rgba(200, 123, 255, 0.4)',
          transform: 'rotate(-2deg)'
        }}
      >
        ORIGINALS
      </div>
    </div>
  );
}
