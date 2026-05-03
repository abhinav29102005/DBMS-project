import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { useAuthStore, AuthState } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { useStudentStats, useStudentSchedule } from '@/hooks/useStudent';
import { useNotifications } from '@/hooks/useCore';
import { Loading } from '@/components/feedback/Loading';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
  Clock,
  ArrowRight,
  Bell,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';

export default function StudentDashboard() {
  const user = useAuthStore((s: AuthState) => s.user);
  const { data: stats, isLoading: isLoadingStats, isError, refetch } = useStudentStats();
  const { data: schedule, isLoading: isLoadingSchedule } = useStudentSchedule();
  const { data: notifications, isLoading: isLoadingNotifs } = useNotifications();

  const isLoading = isLoadingStats || isLoadingSchedule || isLoadingNotifs;

  if (isError) {
    return (
      <ShellLayout role="student">
        <ErrorState onRetry={refetch} />
      </ShellLayout>
    );
  }

  return (
    <ShellLayout role="student">
      <Head>
        <title>Dashboard | Student Portal</title>
      </Head>

      <div className="space-y-8">
        {}
        <section className="relative overflow-hidden rounded-3xl bg-brand-600 p-8 text-white shadow-xl shadow-brand-500/20">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Hello, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-brand-100 max-w-md">
              {isLoading ? (
                <Skeleton className="h-4 w-64 bg-brand-500/50" />
              ) : (
                "Welcome back to your academic portal. You have 3 classes today and 1 upcoming assignment."
              )}
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <GraduationCap size={160} />
          </div>
        </section>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Attendance" subtitle="Current Semester" icon={Clock}>
            {isLoading ? (
              <Skeleton className="h-10 w-24 mt-2" />
            ) : (
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">{stats?.attendance || '84%'}</span>
                <span className="ml-2 text-sm font-medium text-green-600">+2%</span>
              </div>
            )}
          </Card>
          <Card title="Current GPA" subtitle="Academic Standing" icon={TrendingUp}>
            {isLoading ? (
              <Skeleton className="h-10 w-24 mt-2" />
            ) : (
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">{stats?.gpa || '3.82'}</span>
                <span className="ml-2 text-sm font-medium text-blue-600">Top 5%</span>
              </div>
            )}
          </Card>
          <Card title="Courses" subtitle="Registered This Term" icon={BookOpen}>
            {isLoading ? (
              <Skeleton className="h-10 w-24 mt-2" />
            ) : (
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">{stats?.coursesCount || '6'}</span>
                <span className="ml-2 text-sm font-medium text-gray-500">18 Credits</span>
              </div>
            )}
          </Card>
          <Card title="Fines" subtitle="Library & Fees" icon={Calendar}>
            {isLoading ? (
              <Skeleton className="h-10 w-24 mt-2" />
            ) : (
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">{stats?.fines || '$0.00'}</span>
                <span className="ml-2 text-sm font-medium text-green-600">Clear</span>
              </div>
            )}
          </Card>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
              <button className="text-sm font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1.5 transition-colors">
                View Full Calendar <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {isLoadingSchedule ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)
              ) : schedule?.length === 0 ? (
                <Card className="py-12 text-center">
                  <Calendar size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500 font-medium">No classes scheduled for today.</p>
                </Card>
              ) : (
                schedule?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-6 p-5 rounded-[2rem] bg-white border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all group cursor-pointer">
                    <div className="w-24 text-center">
                      <span className="block text-sm font-bold text-gray-400 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                        {item.start_time.slice(0, 5)}
                      </span>
                      <span className="block text-[10px] font-bold text-gray-300 group-hover:text-brand-400 transition-colors">
                        to {item.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="w-1.5 h-12 rounded-full bg-brand-500 group-hover:scale-y-110 transition-transform" />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-tight">{item.subject}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                          <MapPin size={12} className="text-brand-400" /> {item.room || 'TBA'}
                        </span>
                        <span className="text-xs font-bold text-gray-500">•</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section {item.section_code}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity/Notifications */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Updates</h2>
            <Card className="p-0 overflow-hidden border-0 shadow-lg">
              <div className="divide-y divide-gray-50">
                {isLoadingNotifs ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)
                ) : notifications?.length === 0 ? (
                  <div className="p-10 text-center">
                    <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">All caught up!</p>
                  </div>
                ) : (
                  notifications?.map((update: any, i: number) => (
                    <div key={i} className={cn(
                      "p-5 hover:bg-gray-50/80 transition-colors cursor-pointer group relative overflow-hidden",
                      !update.is_read && "bg-brand-50/30"
                    )}>
                      {!update.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
                      )}
                      <div className="flex justify-between items-start mb-1.5">
                        <h5 className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{update.title}</h5>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(update.created_at), 'MMM d')}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">{update.message}</p>
                    </div>
                  ))
                )}
              </div>
              <button className="w-full py-4 text-[11px] font-bold text-brand-600 bg-gray-50/50 hover:bg-brand-50 hover:text-brand-700 transition-all uppercase tracking-widest border-t border-gray-100">
                View All Notifications
              </button>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
