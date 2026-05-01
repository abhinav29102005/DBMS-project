import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, Users, AlertCircle, Search, MapPin, Grid } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';

const BLOCKS = [
  { id: 'A', rooms: 120, occupied: 110, status: 'Near Full' },
  { id: 'B', rooms: 120, occupied: 95, status: 'Optimal' },
  { id: 'C', rooms: 150, occupied: 142, status: 'Near Full' },
  { id: 'D', rooms: 100, occupied: 45, status: 'Available' },
];

export default function AdminHostelPage() {
  return (
    <ShellLayout role="admin">
      <Head>
        <title>Hostel Management | Admin Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hostel Management</h1>
            <p className="text-sm text-gray-500">Monitor occupancy, blocks, and allotments.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Maintenance Logs</Button>
            <Button variant="primary">New Allocation</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Total Capacity" subtitle="All Blocks" icon={Building2}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">490</span>
              <span className="ml-2 text-xs text-gray-400">Total Beds</span>
            </div>
          </Card>
          <Card title="Occupied" subtitle="Current Residents" icon={Users}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">392</span>
              <span className="ml-2 text-xs text-green-600">80% Rate</span>
            </div>
          </Card>
          <Card title="Available" subtitle="Ready for Intake" icon={Grid}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">98</span>
              <span className="ml-2 text-xs text-brand-600">Vacant</span>
            </div>
          </Card>
          <Card title="Alerts" subtitle="Critical Issues" icon={AlertCircle}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-red-600">4</span>
              <span className="ml-2 text-xs text-red-400">Action Req</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Block Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {BLOCKS.map((block) => (
                <Card key={block.id} className="group hover:border-brand-500 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <span className="text-xl font-bold">{block.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      block.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {block.status}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500">Occupancy</span>
                      <span className="text-gray-900">{block.occupied} / {block.rooms}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          (block.occupied/block.rooms) > 0.9 ? 'bg-red-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${(block.occupied/block.rooms)*100}%` }} 
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Search</h2>
            <Card>
              <div className="space-y-4">
                <Input placeholder="Search room or resident..." icon={Search} />
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                      AK
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Abhinav Kumar</h4>
                      <p className="text-[10px] text-gray-400">Block A • Room 302</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-xs">View Details</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
