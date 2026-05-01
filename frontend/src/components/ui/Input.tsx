'use client';

import { InputHTMLAttributes, forwardRef, ElementType } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon | ElementType;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, containerClassName, icon: Icon, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label className="text-sm font-semibold text-gray-700 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50',
              Icon && 'pl-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
