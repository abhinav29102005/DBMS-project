'use client';

import { useDevice } from '@/hooks/useDevice';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNav } from './MobileNav';
import { TopBar } from './TopBar';
import { Role } from '@/types/api';
import { ReactNode, useEffect } from 'react';

import { useProfileStatus } from '@/hooks/useProfile';
import { useRouter } from 'next/router';
import { Loading } from '../feedback/Loading';

import { motion, AnimatePresence } from 'framer-motion';

export function ShellLayout({ children, role }: { children: ReactNode; role: Role }) {
  const device = useDevice();
  const router = useRouter();
  const { data: status, isLoading } = useProfileStatus();

  useEffect(() => {
    if (!isLoading && status && !status.isComplete && router.pathname !== '/profile/setup') {
      router.push('/profile/setup');
    }
  }, [status, isLoading, router]);

  if (isLoading) return <Loading fullScreen />;

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: 'easeOut' }
  } as const;

  if (device === 'mobile') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <TopBar role={role} />
        <main className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
          <AnimatePresence mode="wait">
            <motion.div key={router.pathname} {...pageTransition} className="max-w-md mx-auto">
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileNav role={role} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <DesktopSidebar role={role} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="mobile:hidden">
          <TopBar role={role} />
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div key={router.pathname} {...pageTransition} className="max-w-7xl mx-auto">
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
