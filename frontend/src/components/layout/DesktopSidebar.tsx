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
    { href: '/admin/hostel',    icon: Building2,       label: 'Hostel Mgmt' },
    { href: '/admin/library',   icon: Library,         label: 'Library Mgmt' },
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
    <aside className={`relative flex flex-col bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center px-5 h-16 border-b border-gray-100 overflow-hidden">
        <Logo iconOnly={collapsed} />
      </div>

      <nav className="flex-1 py-6 space-y-1 px-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link 
              key={href} 
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group
                ${active 
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} className={`flex-shrink-0 transition-colors ${active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
        >
          <Settings size={20} strokeWidth={1.5} className="flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors group"
        >
          <LogOut size={20} strokeWidth={1.5} className="flex-shrink-0 text-red-400 group-hover:text-red-500" />
          {!collapsed && <span>Logout</span>}
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
