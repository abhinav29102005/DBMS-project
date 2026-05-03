'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-xl shadow-brand-500/20 active:scale-[0.97]',
      secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100/80 active:scale-[0.97]',
      outline: 'border-2 border-gray-100 bg-white text-gray-700 hover:border-brand-200 hover:text-brand-600 shadow-sm active:scale-[0.97]',
      ghost: 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-brand-600',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20 active:scale-[0.97]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl',
      md: 'px-6 py-3 text-sm font-bold rounded-2xl',
      lg: 'px-8 py-4 text-base font-bold rounded-[1.25rem]',
      xl: 'px-10 py-5 text-lg font-bold rounded-[1.5rem]',
    };

    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
