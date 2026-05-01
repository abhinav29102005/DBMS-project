'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, BookOpen, Building2, Library, FileText, LayoutDashboard, Users, GraduationCap } from 'lucide-react';
import { Role } from '@/types/api';

const STUDENT_TABS = [
  { href: '/student/dashboard', icon: Home,      label: 'Home'    },
  { href: '/student/courses',   icon: BookOpen,   label: 'Courses' },
  { href: '/student/hostel',    icon: Building2,  label: 'Hostel'  },
  { href: '/student/library',   icon: Library,    label: 'Library' },
  { href: '/student/results',   icon: FileText,   label: 'Results' },
];

const FACULTY_TABS = [
  { href: '/faculty/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/faculty/offerings', icon: BookOpen,        label: 'Courses' },
  { href: '/faculty/marks',     icon: FileText,        label: 'Marks' },
];

const ADMIN_TABS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/admin/students',  icon: Users,           label: 'Students' },
  { href: '/admin/hostel',    icon: Building2,       label: 'Hostel' },
  { href: '/admin/library',   icon: Library,         label: 'Library' },
];

export function MobileNav({ role }: { role: Role }) {
  const router = useRouter();
  const pathname = router.pathname;

  const tabs = role === 'student'
    ? STUDENT_TABS
    : role === 'faculty'
    ? FACULTY_TABS
    : ADMIN_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-white safe-area-pb shadow-lg">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center py-2 gap-0.5 transition-colors
              ${active ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
