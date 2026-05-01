import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { useAuthStore, AuthState } from '@/store/authStore';
import { useAdminStats } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  Users,
  Building2,
  BookOpen,
  AlertCircle,
  BarChart3,
  UserCheck
} from 'lucide-react';
import Head from 'next/head';
import { Button } from '@/components/ui/Button';
import { DashboardChart } from '@/components/ui/DashboardChart';

const ENROLLMENT_DATA = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 45 },
  { name: 'Mar', value: 35 },
  { name: 'Apr', value: 60 },
  { name: 'May', value: 55 },
  { name: 'Jun', value: 80 },
  { name: 'Jul', value: 75 },
  { name: 'Aug', value: 90 },
];

export default function AdminDashboard() {
  const user = useAuthStore((s: AuthState) => s.user);
  const { data: stats, isLoading, isError, refetch } = useAdminStats();

  if (isError) {
    return (
      <ShellLayout role="admin">
        <ErrorState onRetry={refetch} />
      </ShellLayout>
    );
  }

  return (
    <ShellLayout role="admin">
      <Head>
        <title>Admin Dashboard | UIMS Portal</title>
      </Head>

      <div className="space-y-8">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h1>
            <p className="text-gray-500 font-medium">Welcome, System Administrator</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">System Online</span>
            <span className="text-xs text-gray-400 font-medium">Last synced: Just now</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2" title="Enrollment Trends" icon={BarChart3}>
            <DashboardChart
              data={ENROLLMENT_DATA}
              categoryKey="name"
              dataKey="value"
              colors={['#185FA5']}
            />
          </Card>

          <Card title="System Alerts" icon={AlertCircle}>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Database Warning</h4>
                  <p className="text-xs text-red-700 leading-relaxed">Latency spike detected in Region-1 nodes.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3">
                <AlertCircle className="text-orange-500 shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-orange-900">Audit Required</h4>
                  <p className="text-xs text-orange-700 leading-relaxed">Hostel allotment logs for Block C need review.</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs">View All Logs</Button>
            </div>
          </Card>
        </div>
      </div>
    </ShellLayout>
  );
}
