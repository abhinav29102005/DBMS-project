import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ title, subtitle, icon: Icon, children, className, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all",
        onClick && "cursor-pointer hover:border-brand-200 hover:shadow-md active:scale-[0.98]",
        className
      )}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-sm font-bold text-gray-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Icon size={20} strokeWidth={1.5} />
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
