import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly }: Props) {
  return (
    <div className={cn("flex items-center gap-3.5 select-none group cursor-pointer", className)}>
      <div className="flex-shrink-0 h-11 w-11 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 group-hover:rotate-6 transition-all duration-500">
        <GraduationCap size={26} strokeWidth={2.5} />
      </div>
      {!iconOnly && (
        <div className="flex flex-col -space-y-1.5">
          <span className="font-display font-black text-gray-900 text-2xl tracking-tighter uppercase italic">
            UIMS
          </span>
          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest pl-0.5">
            Academic Portal
          </span>
        </div>
      )}
    </div>
  );
}
