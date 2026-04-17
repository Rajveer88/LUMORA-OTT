import React, { useEffect, useState } from 'react';
import { useToast, ToastType } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../utils/cn';

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    color: 'bg-green-500',
    accent: 'border-green-500/50'
  },
  error: {
    icon: AlertCircle,
    color: 'bg-red-500',
    accent: 'border-red-500/50'
  },
  info: {
    icon: Info,
    color: 'bg-accent-cyan',
    accent: 'border-accent-cyan/50'
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-orange-500',
    accent: 'border-orange-500/50'
  }
};

function ToastItem({ id, message, type, duration, onRemove }: any) {
  const config = TOAST_CONFIG[type as ToastType];
  const Icon = config.icon;
  
  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="relative group w-80 bg-[rgba(15,15,20,0.9)] border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl overflow-hidden"
    >
      {/* Left Accent Bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-[2px]", config.color)} />
      
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-xl bg-white/5", config.accent)}>
          <Icon className={cn("w-4 h-4", type === 'info' ? 'text-accent-cyan' : `text-${type === 'error' ? 'red' : type === 'success' ? 'green' : 'orange'}-500`)} />
        </div>
        
        <div className="flex-1 pt-1">
          <p className="text-[13px] font-bold text-white leading-tight">
            {message}
          </p>
        </div>

        <button 
          onClick={() => onRemove(id)}
          className="p-1 text-white/20 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={cn("absolute bottom-0 left-0 h-[2px] opacity-30", config.color)}
      />
    </motion.div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[9000] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem 
              {...toast} 
              onRemove={removeToast} 
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
