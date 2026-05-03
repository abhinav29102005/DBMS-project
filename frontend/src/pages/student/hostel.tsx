import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, MapPin, User, ShieldCheck, CreditCard, Calendar, QrCode } from 'lucide-react';
import Head from 'next/head';
import { QRCodeCanvas } from 'qrcode.react';
import { exportToPDF } from '@/lib/pdfExport';

import { useStudentHostel } from '@/hooks/useStudent';
import { Loading } from '@/components/feedback/Loading';
import { useState } from 'react';

import { ErrorState } from '@/components/feedback/ErrorState';

export default function StudentHostelPage() {
  const { data: allocation, isLoading, isError, refetch } = useStudentHostel();

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
                      <h3 className="text-xl font-black text-gray-900 truncate">{allocation.hostelName}</h3>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room</span>
                      <h3 className="text-4xl font-black text-gray-900">{allocation.roomNo}</h3>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bed No.</span>
                      <h3 className="text-4xl font-black text-gray-900">{allocation.bedLabel}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Block</p>
                        <p className="text-sm font-bold text-gray-700">{allocation.blockName}</p>
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
                <Button variant="outline" className="w-full mt-4" disabled={!allocation}>Raise Complaint</Button>
              </Card>
              <Card title="Outpass" subtitle="Apply for leave" icon={Calendar}>
                <Button variant="outline" className="w-full mt-4" disabled={!allocation}>New Request</Button>
              </Card>
            </div>
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
                  onClick={() => {
                    exportToPDF({
                      title: 'Hostel Allocation Receipt',
                      filename: `hostel-receipt-${allocation.roomNo}`,
                      headers: ['Detail', 'Value'],
                      data: [
                        ['Hostel Name', allocation.hostelName],
                        ['Block', allocation.blockName],
                        ['Room No.', allocation.roomNo],
                        ['Bed Label', allocation.bedLabel],
                        ['Status', allocation.status.toUpperCase()],
                        ['Valid From', new Date(allocation.allocated_from).toLocaleDateString()]
                      ]
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
