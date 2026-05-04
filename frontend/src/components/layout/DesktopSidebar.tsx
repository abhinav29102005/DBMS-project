'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  Building2,
  Library,
  FileText,
  LayoutDashboard,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { Role } from '@/types/api';
import { useAuthStore } from '@/store/authStore';
import { Logo } from '@/components/common/Logo';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  icon: any;
  label: string;
  section?: string;
}

const NAV_MAP: Record<string, NavItem[]> = {
  student: [
    { href: '/student/dashboard', icon: Home,      label: 'Dashboard' },
    { href: '/student/courses',   icon: BookOpen,   label: 'Courses' },
    { href: '/student/hostel',    icon: Building2,  label: 'Hostel' },
    { href: '/student/library',   icon: Library,    label: 'Library' },
    { href: '/student/results',   icon: FileText,   label: 'Examination' },
  ],
  faculty: [
    { href: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/faculty/offerings', icon: BookOpen,        label: 'My Offerings' },
    { href: '/faculty/marks',     icon: FileText,        label: 'Marks Entry' },
    { href: '/faculty/advisees',  icon: Users,           label: 'My Advisees' },
  ],
  admin: [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/students',  icon: Users,           label: 'Student Records' },
    { href: '/admin/hostel',    icon: Building2,       label: 'Hostel Management' },
    { href: '/admin/library',   icon: Library,         label: 'Library Management' },
  ],
};

export function DesktopSidebar({ role }: { role: Role }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = router.pathname;
  const clearAuth = useAuthStore(s => s.clearAuth);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored) setCollapsed(stored === 'true');
  }, []);

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem('sidebar-collapsed', String(!c));
      return !c;
    });
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  const navItems = NAV_MAP[role] || [];

  return (
    <aside className={`sticky top-0 h-screen flex flex-col bg-white border-r border-gray-100 transition-all duration-500 ease-in-out ${collapsed ? 'w-24' : 'w-72'}`}>
      <div className="flex items-center px-8 h-20 border-b border-gray-50 overflow-hidden shrink-0">
        <Logo iconOnly={collapsed} />
      </div>

      <nav className="flex-1 py-8 space-y-2 px-4 overflow-y-auto no-scrollbar">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] transition-all duration-300 group relative
                ${active
                  ? 'bg-brand-50 text-brand-700 font-bold shadow-sm shadow-brand-500/5'
                  : 'text-gray-500 hover:bg-gray-50/80 hover:text-gray-900 font-semibold'}`}
            >
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1.5 h-6 bg-brand-600 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={22} strokeWidth={active ? 2.5 : 2} className={`flex-shrink-0 transition-all duration-300 ${active ? 'text-brand-600 scale-110' : 'text-gray-400 group-hover:text-gray-700'}`} />
              {!collapsed && <span className="truncate tracking-tight font-display">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 space-y-1.5 shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group"
        >
          <Settings size={22} strokeWidth={2} className="flex-shrink-0 text-gray-400 group-hover:text-gray-700 transition-all" />
          {!collapsed && <span className="font-display tracking-tight">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <LogOut size={22} strokeWidth={2} className="flex-shrink-0 text-red-400/70 group-hover:text-red-500 group-hover:rotate-12 transition-all duration-300" />
          {!collapsed && <span className="font-display tracking-tight">Logout</span>}
        </button>
      </div>

      <button
        onClick={toggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={14} className="text-gray-600" /> : <ChevronLeft size={14} className="text-gray-600" />}
      </button>
    </aside>
  );
}
