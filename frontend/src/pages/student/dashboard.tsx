import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useStudentStats } from '@/hooks/useStudent';
import { Loading } from '@/components/feedback/Loading';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  TrendingUp, 
  Clock,
  ArrowRight
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user);
  const { data: stats, isLoading, isError, refetch } = useStudentStats();

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
        {/* Welcome Section */}
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

        {/* Quick Stats Grid */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
              <button className="text-sm font-semibold text-brand-600 hover:text-brand-500 flex items-center gap-1 transition-colors">
                View Full Calendar <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
              ) : (
                [
                  { time: '09:00 AM', subject: 'Database Management Systems', room: 'Lab 402', color: 'bg-blue-500' },
                  { time: '11:30 AM', subject: 'Software Engineering', room: 'Room 101', color: 'bg-purple-500' },
                  { time: '02:30 PM', subject: 'Machine Learning', room: 'Seminar Hall', color: 'bg-orange-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-white border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                    <div className="w-20 text-sm font-bold text-gray-400 group-hover:text-brand-600 transition-colors">
                      {item.time}
                    </div>
                    <div className={`w-1 self-stretch rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{item.subject}</h4>
                      <p className="text-xs text-gray-500">{item.room}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity/Notifications */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Updates</h2>
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {isLoading ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)
                ) : (
                  [
                    { title: 'Result Published', desc: 'Computer Networks - Midterm', time: '2h ago' },
                    { title: 'Library Alert', desc: 'Return "Introduction to Algorithms"', time: '1d ago' },
                    { title: 'Hostel Notice', desc: 'Maintenance scheduled for Block A', time: '2d ago' },
                  ].map((update, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-sm font-bold text-gray-900">{update.title}</h5>
                        <span className="text-[10px] font-medium text-gray-400">{update.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{update.desc}</p>
                    </div>
                  ))
                )}
              </div>
              <button className="w-full py-3 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                View All Notifications
              </button>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
