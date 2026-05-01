import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly }: Props) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
        <GraduationCap size={24} strokeWidth={2.5} />
      </div>
      {!iconOnly && (
        <span className="font-black text-gray-900 text-2xl tracking-tighter">
          UIMS
        </span>
      )}
    </div>
  );
}
