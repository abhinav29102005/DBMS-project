import { useState } from 'react';
import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { useAuthStore, AuthState } from '@/store/authStore';
import { useAdminStats, useEnrollmentTrends } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  Users,
  Building2,
  BookOpen,
  AlertCircle,
  BarChart3,
  UserCheck,
  Database
} from 'lucide-react';
import Head from 'next/head';
import { Button } from '@/components/ui/Button';
import { DashboardChart } from '@/components/ui/DashboardChart';
import { DataEditor } from '@/components/admin/DataEditor';

export default function AdminDashboard() {
  const user = useAuthStore((s: AuthState) => s.user);
  const { data: stats, isLoading, isError, refetch } = useAdminStats();
  const { data: trends, isLoading: trendsLoading } = useEnrollmentTrends();
  const [activeTable, setActiveTable] = useState<{schema: string, table: string, title: string} | null>(null);

  if (isError) {
    return (
      <ShellLayout role="admin">
        <ErrorState onRetry={refetch} />
      </ShellLayout>
    );
  }

  const tables = [
    { schema: 'auth', table: 'users', title: 'User Management' },
    { schema: 'academic', table: 'students', title: 'Student Profiles' },
    { schema: 'academic', table: 'faculty', title: 'Faculty Profiles' },
    { schema: 'academic', table: 'courses', title: 'Course Catalog' },
    { schema: 'academic', table: 'course_offerings', title: 'Course Offerings' },
    { schema: 'academic', table: 'departments', title: 'Departments' },
    { schema: 'exam', table: 'marks', title: 'Exam Marks' },
    { schema: 'exam', table: 'final_results', title: 'Final Results' },
    { schema: 'hostel', table: 'rooms', title: 'Hostel Rooms' },
    { schema: 'hostel', table: 'complaints', title: 'Hostel Complaints' },
    { schema: 'hostel', table: 'outpasses', title: 'Outpass Requests' },
    { schema: 'library', table: 'books', title: 'Library Catalog' },
  ];

  return (
    <ShellLayout role="admin">
      <Head>
        <title>Admin Dashboard | UIMS Portal</title>
      </Head>

      <div className="space-y-8 pb-12">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-900 p-8 rounded-3xl text-white shadow-xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
            <p className="text-brand-100 font-medium mt-1">Welcome back, System Administrator</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">System Online</span>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Total Students" subtitle="Active Enrollment" icon={Users} href="/admin/students">
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.totalStudents?.toLocaleString() || 0}</span>
                  <span className="text-sm font-medium text-green-600">Syncing</span>
                </>
              )}
            </div>
          </Card>
          <Card title="Faculty" subtitle="Across Departments" icon={UserCheck} href="/admin/faculty">
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.totalFaculty || 0}</span>
                  <span className="text-sm font-medium text-gray-500">Full-time</span>
                </>
              )}
            </div>
          </Card>
          <Card title="System Health" subtitle="Service Status" icon={Building2} href="/admin/settings">
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.systemHealth || '99.9%'}</span>
                  <span className="text-sm font-medium text-green-600">Stable</span>
                </>
              )}
            </div>
          </Card>
          <Card title="Active Offerings" subtitle="Current Semester" icon={BookOpen} href="/admin/courses">
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.activeCourses || 0}</span>
                  <span className="text-sm font-medium text-brand-600">Ongoing</span>
                </>
              )}
            </div>
          </Card>
          <Card title="Hostel Occupancy" subtitle="Allocated Beds" icon={Building2} href="/admin/hostel">
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.hostelOccupancy || 0}</span>
                  <span className="text-sm font-medium text-orange-600">Beds</span>
                </>
              )}
            </div>
          </Card>
          <Card title="Library Catalog" subtitle="Total Books" icon={Database} href="/admin/library">
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.library?.total_books || 0}</span>
                  <span className="text-sm font-medium text-purple-600">Records</span>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-brand-600" />
            <h2 className="text-2xl font-bold text-gray-900">DBMS Control Panel</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {tables.map(t => (
              <Button 
                key={t.table} 
                variant={activeTable?.table === t.table ? 'primary' : 'outline'}
                onClick={() => setActiveTable(t)}
              >
                {t.title}
              </Button>
            ))}
            {activeTable && (
              <Button variant="outline" onClick={() => setActiveTable(null)} className="ml-auto text-gray-500 hover:text-red-600 border-dashed">
                Close Editor
              </Button>
            )}
          </div>

          {activeTable ? (
            <DataEditor schema={activeTable.schema} table={activeTable.table} title={activeTable.title} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2" title="Enrollment Trends" icon={BarChart3}>
                {trendsLoading ? <Skeleton className="h-[300px] w-full" /> : (
                  <DashboardChart
                    data={trends || []}
                    categoryKey="name"
                    dataKey="value"
                    colors={['#185FA5']}
                  />
                )}
              </Card>

              <Card title="Recent System Activity" icon={AlertCircle}>
                <div className="space-y-4">
                  {isLoading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />) : (
                    (stats?.recentActivity?.length || 0) > 0 ? (
                      stats?.recentActivity.map((log: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <h4 className="text-xs font-bold text-gray-900">{log.action}</h4>
                          <p className="text-[10px] text-gray-500">{log.user} • {new Date(log.time).toLocaleTimeString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-xs italic">
                        No recent activity logs found.
                      </div>
                    )
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ShellLayout>
  );
}
