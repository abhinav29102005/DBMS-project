import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, MapPin, User, ShieldCheck, CreditCard, Calendar } from 'lucide-react';
import Head from 'next/head';

export default function StudentHostelPage() {
  const allocation = {
    block: 'A',
    room: '302',
    bed: '1',
    warden: 'Mr. Rajesh Kumar',
    fees: 'Clear',
    dueDate: '2024-06-15'
  };

  return (
    <ShellLayout role="student">
      <Head>
        <title>Hostel Allocation | Student Portal</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hostel & Accommodation</h1>
          <p className="text-sm text-gray-500">Manage your stay and services.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {}
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
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Block</span>
                    <h3 className="text-4xl font-black text-gray-900">{allocation.block}</h3>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room</span>
                    <h3 className="text-4xl font-black text-gray-900">{allocation.room}</h3>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bed No.</span>
                    <h3 className="text-4xl font-black text-gray-900">{allocation.bed}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Warden</p>
                      <p className="text-sm font-bold text-gray-700">{allocation.warden}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
                      <p className="text-sm font-bold text-gray-700">North Campus, Near Gate 2</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Maintenance" subtitle="Report issues in your room" icon={ShieldCheck}>
                <Button variant="outline" className="w-full mt-4">Raise Complaint</Button>
              </Card>
              <Card title="Outpass" subtitle="Apply for leave" icon={Calendar}>
                <Button variant="outline" className="w-full mt-4">New Request</Button>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card title="Billing Status" icon={CreditCard}>
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-green-700 uppercase">Hostel Fees</span>
                    <span className="text-xs font-bold text-green-700 uppercase">{allocation.fees}</span>
                  </div>
                  <p className="text-[10px] text-green-600">No pending dues for current term.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Security Deposit</span>
                    <span className="font-bold text-gray-900">$500.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mess Charges</span>
                    <span className="font-bold text-gray-900">$120.00</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between text-base">
                    <span className="font-bold text-gray-900">Total Paid</span>
                    <span className="font-bold text-brand-600">$620.00</span>
                  </div>
                </div>

                <Button variant="secondary" className="w-full">Download Receipt</Button>
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
