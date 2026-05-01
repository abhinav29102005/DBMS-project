'use client';

import { useDevice } from '@/hooks/useDevice';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNav } from './MobileNav';
import { TopBar } from './TopBar';
import { Role } from '@/types/api';
import { ReactNode } from 'react';

export function ShellLayout({ children, role }: { children: ReactNode; role: Role }) {
  const device = useDevice();

  if (device === 'mobile') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <TopBar role={role} />
        <main className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
          <div className="max-w-md mx-auto">
            {children}
          </div>
        </main>
        <MobileNav role={role} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar role={role} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="mobile:hidden">
          <TopBar role={role} />
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
