import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, MapPin, User, ShieldCheck, CreditCard, Calendar, QrCode } from 'lucide-react';
import Head from 'next/head';
import { QRCodeCanvas } from 'qrcode.react';
import { exportToPDF } from '@/lib/pdfExport';

import { useStudentHostel, useStudentStats } from '@/hooks/useStudent';
import { hostelService } from '@/services/hostel/hostelService';
import { Loading } from '@/components/feedback/Loading';
import { useState } from 'react';
import { toast } from 'sonner';

import { ErrorState } from '@/components/feedback/ErrorState';

export default function StudentHostelPage() {
  const { data: allocation, isLoading, isError, refetch } = useStudentHostel();
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [isOutpassOpen, setIsOutpassOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [complaintData, setComplaintData] = useState({ category: 'Other', description: '', priority: 'medium' });
  const [outpassData, setOutpassData] = useState({ reason: '', destination: '', outTime: '', inTime: '' });

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await hostelService.raiseComplaint(complaintData as any);
      toast.success('Complaint raised successfully');
      setIsComplaintOpen(false);
      setComplaintData({ category: 'Other', description: '', priority: 'medium' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to raise complaint');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOutpassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await hostelService.requestOutpass(outpassData);
      toast.success('Outpass request submitted');
      setIsOutpassOpen(false);
      setOutpassData({ reason: '', destination: '', outTime: '', inTime: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to request outpass');
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) return <ShellLayout role="student"><Loading fullScreen /></ShellLayout>;
  if (isError) return <ShellLayout role="student"><ErrorState onRetry={refetch} /></ShellLayout>;

  return (
    <ShellLayout role="student">
      <Head>
        <title>Hostel Allocation | Student Portal</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hostel & Accommodation</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your stay and request residential services.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {allocation ? (
              <Card className="relative overflow-hidden border-2 border-brand-100">
                <div className="absolute top-0 right-0 p-8 text-brand-50">
                  <Building2 size={120} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase">
                      Active Allocation
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hostel</span>
                      <h3 className="text-xl font-black text-gray-900 truncate">{allocation.hostel_name}</h3>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room</span>
                      <h3 className="text-4xl font-black text-gray-900">{allocation.room_no}</h3>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bed No.</span>
                      <h3 className="text-4xl font-black text-gray-900">{allocation.bed_label}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Block</p>
                        <p className="text-sm font-bold text-gray-700">{allocation.block_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                        <p className="text-sm font-bold text-gray-700 uppercase">{allocation.status}</p>
                      </div>
                    </div>
                  </div>

                  {allocation.qr_code_id && (
                    <div className="absolute top-6 right-6 hidden sm:block bg-white p-2 rounded-lg shadow-sm border">
                      <QRCodeCanvas value={allocation.qr_code_id} size={80} level="H" />
                      <p className="text-[8px] text-center mt-1 text-gray-500 uppercase font-bold">Entry Pass</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center flex flex-col items-center justify-center">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
                   <Building2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Allocation</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  You don't have a hostel room allocated yet. You can browse available hostels and request an allocation.
                </p>
                <Button onClick={() => window.location.href = '/student/hostel/browse'}>Browse Hostels</Button>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Maintenance" subtitle="Report issues in your room" icon={ShieldCheck}>
                <Button variant="outline" className="w-full mt-4" disabled={!allocation} onClick={() => setIsComplaintOpen(true)}>Raise Complaint</Button>
              </Card>
              <Card title="Outpass" subtitle="Apply for leave" icon={Calendar}>
                <Button variant="outline" className="w-full mt-4" disabled={!allocation} onClick={() => setIsOutpassOpen(true)}>New Request</Button>
              </Card>
            </div>

            {/* Complaint Modal */}
            {isComplaintOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <Card className="w-full max-w-md bg-white">
                  <h3 className="text-xl font-bold mb-4">Raise Maintenance Complaint</h3>
                  <form onSubmit={handleComplaintSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                      <select 
                        className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={complaintData.category}
                        onChange={e => setComplaintData({...complaintData, category: e.target.value})}
                      >
                        <option>Cleaning</option>
                        <option>Electrical</option>
                        <option>Plumbing</option>
                        <option>Internet</option>
                        <option>Furniture</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                      <textarea 
                        className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px]"
                        placeholder="Describe the issue..."
                        value={complaintData.description}
                        onChange={e => setComplaintData({...complaintData, description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsComplaintOpen(false)}>Cancel</Button>
                      <Button type="submit" className="flex-1" loading={formLoading}>Submit</Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {/* Outpass Modal */}
            {isOutpassOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <Card className="w-full max-w-md bg-white">
                  <h3 className="text-xl font-bold mb-4">Request Outpass</h3>
                  <form onSubmit={handleOutpassSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Destination</label>
                      <input 
                        className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Where are you going?"
                        value={outpassData.destination}
                        onChange={e => setOutpassData({...outpassData, destination: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Reason</label>
                      <input 
                        className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Reason for leaving"
                        value={outpassData.reason}
                        onChange={e => setOutpassData({...outpassData, reason: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Out Time</label>
                        <input 
                          type="datetime-local"
                          className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                          value={outpassData.outTime}
                          onChange={e => setOutpassData({...outpassData, outTime: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">In Time</label>
                        <input 
                          type="datetime-local"
                          className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                          value={outpassData.inTime}
                          onChange={e => setOutpassData({...outpassData, inTime: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOutpassOpen(false)}>Cancel</Button>
                      <Button type="submit" className="flex-1" loading={formLoading}>Request</Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card title="Billing Status" icon={CreditCard}>
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border ${allocation ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold uppercase ${allocation ? 'text-green-700' : 'text-gray-700'}`}>Hostel Fees</span>
                    <span className={`text-xs font-bold uppercase ${allocation ? 'text-green-700' : 'text-gray-700'}`}>{allocation ? 'Clear' : 'N/A'}</span>
                  </div>
                  <p className={`text-[10px] ${allocation ? 'text-green-600' : 'text-gray-600'}`}>
                    {allocation ? 'No pending dues for current term.' : 'Apply for allocation to see billing.'}
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  disabled={!allocation}
                  onClick={async () => {
                    await exportToPDF({
                      title: 'Hostel Allocation Receipt',
                      filename: `hostel-receipt-${allocation.room_no}`,
                      headers: ['Detail', 'Value'],
                      data: [
                        ['Hostel Name', allocation.hostel_name],
                        ['Block', allocation.block_name],
                        ['Room No.', allocation.room_no],
                        ['Bed Label', allocation.bed_label],
                        ['Status', allocation.status.toUpperCase()],
                        ['Valid From', new Date(allocation.allocated_from).toLocaleDateString()],
                        ['Verification (Scan)', allocation.qr_code_id]
                      ],
                      qrDataIndex: 1
                    });
                  }}
                >
                  Download Receipt
                </Button>
              </div>
            </Card>

            <Card title="Hostel Rules" subtitle="Read carefully">
              <ul className="text-xs text-gray-500 space-y-3 list-disc pl-4">
                <li>Curfew time: 10:00 PM</li>
                <li>Guests not allowed in rooms</li>
                <li>No electric appliances allowed</li>
                <li>Silence hours: 11:00 PM - 06:00 AM</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
