'use client';

import { useDevice } from '@/hooks/useDevice';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Adaptive Drawer/Modal component.
 * Renders a bottom sheet on mobile and a centered modal on desktop.
 */
export function Drawer({ open, onClose, title, children, className }: Props) {
  const device = useDevice();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const isMobile = device === 'mobile';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div 
        className={cn(
          "relative bg-white shadow-2xl transition-all duration-300 ease-out outline-none",
          isMobile 
            ? "w-full rounded-t-3xl p-6 pb-12 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300" 
            : "w-full max-w-lg rounded-2xl p-8 animate-in zoom-in-95 duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 flex-shrink-0" />
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {!isMobile && (
            <button 
              onClick={onClose} 
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
