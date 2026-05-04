import { useState } from 'react';
import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, Users, AlertCircle, Search, MapPin, Grid, Wrench } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';
import { useAdminHostelStats } from '@/hooks/useAdmin';
import { Loading } from '@/components/feedback/Loading';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { hostelService } from '@/services/hostel/hostelService';
import { toast } from 'sonner';

export default function AdminHostelPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminHostelStats();
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [allocationData, setAllocationData] = useState({ studentId: '', bedId: '' });

  if (isLoading) return <ShellLayout role="admin"><Loading fullScreen /></ShellLayout>;
  if (isError) return <ShellLayout role="admin"><ErrorState onRetry={refetch} /></ShellLayout>;

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hostelService.allocateBed(allocationData);
      toast.success('Bed allocated successfully');
      setIsAllocationModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Allocation failed');
    }
  };

  const totalCapacity = stats?.reduce((acc: number, b: any) => acc + parseInt(b.total_beds), 0) || 0;
  const totalOccupied = stats?.reduce((acc: number, b: any) => acc + parseInt(b.occupied_beds), 0) || 0;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

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
            <Button variant="outline" onClick={() => setIsMaintenanceModalOpen(true)} className="gap-2">
              <Wrench size={16} /> Maintenance
            </Button>
            <Button variant="primary" onClick={() => setIsAllocationModalOpen(true)}>New Allocation</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Total Capacity" subtitle="All Blocks" icon={Building2}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{totalCapacity}</span>
              <span className="ml-2 text-xs text-gray-400">Total Beds</span>
            </div>
          </Card>
          <Card title="Occupied" subtitle="Current Residents" icon={Users}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{totalOccupied}</span>
              <span className={`ml-2 text-xs font-bold ${occupancyRate > 90 ? 'text-red-600' : 'text-green-600'}`}>
                {occupancyRate}% Rate
              </span>
            </div>
          </Card>
          <Card title="Available" subtitle="Ready for Intake" icon={Grid}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{totalCapacity - totalOccupied}</span>
              <span className="ml-2 text-xs text-brand-600 font-bold">Vacant</span>
            </div>
          </Card>
          <Card title="Blocks" subtitle="Active Modules" icon={MapPin}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{stats?.length || 0}</span>
              <span className="ml-2 text-xs text-gray-400 font-bold">Active</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Block Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats?.map((block: any) => (
                <Card key={block.block_id} className="group hover:border-brand-500 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{block.hostel_name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{block.block_name}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500">Occupancy</span>
                      <span className="text-gray-900">{block.occupied_beds} / {block.total_beds}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          (block.occupied_beds / block.total_beds) > 0.9 ? 'bg-red-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${(block.occupied_beds / block.total_beds) * 100}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <Card className="bg-brand-600 text-white border-0 shadow-xl shadow-brand-500/20">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-brand-100 text-sm mb-4">You can manage all hostel operations including room changes from the DBMS panel.</p>
              <Button variant="secondary" className="w-full" onClick={() => window.location.href='/admin/dashboard'}>Go to DBMS Panel</Button>
            </Card>
          </div>
        </div>
      </div>

      <Modal isOpen={isAllocationModalOpen} onClose={() => setIsAllocationModalOpen(false)} title="New Bed Allocation">
        <form onSubmit={handleAllocate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Student ID (UUID)</label>
            <Input value={allocationData.studentId} onChange={e => setAllocationData({...allocationData, studentId: e.target.value})} placeholder="Enter Student UUID" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bed ID (UUID)</label>
            <Input value={allocationData.bedId} onChange={e => setAllocationData({...allocationData, bedId: e.target.value})} placeholder="Enter Bed UUID" required />
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAllocationModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Confirm Allocation</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} title="Hostel Maintenance Logs">
        <div className="py-10 text-center">
          <Wrench size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Please use the <b>Hostel Complaints</b> table in the DBMS Control Panel to manage maintenance requests.</p>
          <Button variant="outline" className="mt-6" onClick={() => window.location.href='/admin/dashboard'}>Open DBMS Panel</Button>
        </div>
      </Modal>
    </ShellLayout>
  );
}
