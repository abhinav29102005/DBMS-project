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
    { schema: 'academic', table: 'courses', title: 'Course Catalog' },
    { schema: 'academic', table: 'course_offerings', title: 'Course Offerings' },
    { schema: 'academic', table: 'departments', title: 'Departments' },
    { schema: 'exam', table: 'marks', title: 'Exam Marks' },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Total Students" subtitle="Active Enrollment" icon={Users}>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.totalStudents?.toLocaleString() || 0}</span>
                  <span className="text-sm font-medium text-green-600">+12%</span>
                </>
              )}
            </div>
          </Card>
          <Card title="Faculty" subtitle="Across Departments" icon={UserCheck}>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.totalFaculty || 0}</span>
                  <span className="text-sm font-medium text-gray-500">Full-time</span>
                </>
              )}
            </div>
          </Card>
          <Card title="System Health" subtitle="Service Status" icon={Building2}>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.systemHealth || '99%'}</span>
                  <span className="text-sm font-medium text-green-600">Optimal</span>
                </>
              )}
            </div>
          </Card>
          <Card title="Active Courses" subtitle="System Resources" icon={BookOpen}>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? <Skeleton className="h-9 w-24" /> : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{stats?.activeCourses || 0}</span>
                  <span className="text-sm font-medium text-green-600">Syncing</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 opacity-60 pointer-events-none filter grayscale">
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
