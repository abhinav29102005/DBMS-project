import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { useAuthStore, AuthState } from '@/store/authStore';
import {
  Users,
  Building2,
  Calendar,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import Head from 'next/head';

export default function StaffDashboard() {
  const user = useAuthStore((s: AuthState) => s.user);

  return (
    <ShellLayout role="staff">
      <Head>
        <title>Dashboard | Staff Portal</title>
      </Head>

      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-brand-600 p-8 text-white shadow-xl shadow-brand-500/20">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Hello, {user?.name || 'Staff Member'}! 👋
            </h1>
            <p className="text-brand-100 max-w-md">
              Welcome to the administrative portal. You have 3 pending support requests.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Briefcase size={160} />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Support Tickets" subtitle="Pending" icon={AlertCircle}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">12</span>
              <span className="ml-2 text-sm font-medium text-orange-600">Requires attention</span>
            </div>
          </Card>
          <Card title="Campus Events" subtitle="This Week" icon={Calendar}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">4</span>
              <span className="ml-2 text-sm font-medium text-gray-500">Scheduled</span>
            </div>
          </Card>
          <Card title="Facility Requests" subtitle="Maintenance" icon={Building2}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">7</span>
              <span className="ml-2 text-sm font-medium text-blue-600">Active</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Tickets</h2>
            <div className="space-y-4">
              {[
                { title: 'Projector Issue in Lab 402', status: 'Pending', type: 'IT Support' },
                { title: 'Hostel A AC Maintenance', status: 'In Progress', type: 'Maintenance' },
                { title: 'Library Software Update', status: 'Scheduled', type: 'IT Support' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-md text-gray-600">{item.type}</span>
                  </div>
                  <p className="text-sm font-medium text-orange-600">{item.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {[
                  { title: 'Staff Meeting', desc: 'Mandatory meeting at 3 PM in Conference Room A.', time: 'Today' },
                  { title: 'System Upgrade', desc: 'UIMS will be down for maintenance this weekend.', time: 'Yesterday' },
                ].map((update, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="text-sm font-bold text-gray-900">{update.title}</h5>
                      <span className="text-[10px] font-medium text-gray-400">{update.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{update.desc}</p>
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
