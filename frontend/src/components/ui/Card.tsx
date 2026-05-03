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
        "bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-300",
        onClick && "cursor-pointer hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 active:scale-[0.99]",
        className
      )}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            {title && <h3 className="text-base font-bold text-gray-900 tracking-tight leading-none">{title}</h3>}
            {subtitle && <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="h-11 w-11 rounded-2xl bg-brand-50/50 flex items-center justify-center text-brand-600 border border-brand-100/50">
              <Icon size={22} strokeWidth={2} />
            </div>
          )}
        </div>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
