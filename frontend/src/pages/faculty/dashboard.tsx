import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useFacultyStats, useFacultySchedule } from '@/hooks/useFaculty';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  Users,
  BookOpen,
  FileText,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import Head from 'next/head';

export default function FacultyDashboard() {
  const user = useAuthStore(s => s.user);
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useFacultyStats();
  const { data: schedule, isLoading: scheduleLoading } = useFacultySchedule();

  if (statsError) {
    return (
      <ShellLayout role="faculty">
        <ErrorState onRetry={refetchStats} />
      </ShellLayout>
    );
  }

  return (
    <ShellLayout role="faculty">
      <Head>
        <title>Faculty Dashboard | UIMS Portal</title>
      </Head>

      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-brand-600 p-8 text-white shadow-xl shadow-brand-500/20">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Welcome back, {user?.name || 'Professor'}! 🎓
            </h1>
            <p className="text-brand-100 max-w-md">
              You have 2 lectures today and 45 student marks pending for submission.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BookOpen size={160} />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Total Students" subtitle="Under My Instruction" icon={Users}>
            <div className="mt-2">
              {statsLoading ? <Skeleton className="h-9 w-16" /> : (
                <span className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</span>
              )}
            </div>
          </Card>
          <Card title="Active Courses" subtitle="This Semester" icon={BookOpen}>
            <div className="mt-2">
              {statsLoading ? <Skeleton className="h-9 w-16" /> : (
                <span className="text-3xl font-bold text-gray-900">{stats?.activeCourses || 0}</span>
              )}
            </div>
          </Card>
          <Card title="Avg. Attendance" subtitle="Class Performance" icon={Calendar}>
            <div className="mt-2">
              {statsLoading ? <Skeleton className="h-9 w-16" /> : (
                <span className="text-3xl font-bold text-gray-900">{stats?.avgAttendance || '0%'}</span>
              )}
            </div>
          </Card>
          <Card title="Pending Marks" subtitle="Exam Controller" icon={FileText}>
            <div className="mt-2">
              {statsLoading ? <Skeleton className="h-9 w-16" /> : (
                <span className="text-3xl font-bold text-orange-600">{stats?.pendingMarks || 0}</span>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Today's Lectures</h2>
              <button className="text-sm font-semibold text-brand-600 hover:text-brand-500 flex items-center gap-1">
                Full Schedule <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {scheduleLoading ? (
                [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
              ) : (schedule?.length || 0) > 0 ? (
                schedule?.map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-white border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                    <div className="w-24 text-sm font-bold text-gray-400 group-hover:text-brand-600 transition-colors">
                      {item.time}
                    </div>
                    <div className={`w-1.5 h-12 rounded-full ${item.color || 'bg-brand-500'}`} />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{item.subject}</h4>
                      <p className="text-xs text-gray-500">{item.section} • {item.room}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                  No lectures scheduled for today.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {[
                  { title: 'Submit Midterm Marks', course: 'CS201', date: 'Tomorrow' },
                  { title: 'Project Proposal Review', course: 'CS202', date: 'In 3 days' },
                  { title: 'Final Question Paper', course: 'CS203', date: 'Next Week' },
                ].map((task, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900">{task.title}</h5>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">{task.course}</p>
                    </div>
                    <span className="text-xs font-bold text-brand-600">{task.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
