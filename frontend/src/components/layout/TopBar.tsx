'use client';

import { useAuthStore } from '@/store/authStore';
import { Bell, User } from 'lucide-react';
import { useRouter } from 'next/router';



export function TopBar({ role }: { role: string }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = router.pathname;

  const title = pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'UIMS';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white border-gray-200 px-4 transition-colors">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold font-display capitalize text-gray-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-1.5 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 rounded-full bg-gray-50 p-1 pl-3 pr-1 border">
          <span className="text-xs font-medium text-gray-700 mobile:hidden">
            {user?.name || user?.email?.split('@')[0]}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
