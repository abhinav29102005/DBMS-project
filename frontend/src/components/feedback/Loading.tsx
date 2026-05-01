import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  fullScreen?: boolean;
  className?: string;
}

export function Loading({ fullScreen, className }: Props) {
  return (
    <div className={cn(
      "flex items-center justify-center p-8",
      fullScreen && "fixed inset-0 bg-white/80 backdrop-blur-sm z-[100]",
      className
    )}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-brand-100" />
          <Loader2 className="absolute top-0 left-0 h-12 w-12 text-brand-600 animate-spin" strokeWidth={3} />
        </div>
        <p className="text-sm font-bold text-brand-700 tracking-tight animate-pulse">
          Loading UIMS...
        </p>
      </div>
    </div>
  );
}
