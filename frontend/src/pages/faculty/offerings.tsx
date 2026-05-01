import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, FileText, CheckCircle, BarChart3, Settings } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';

const MOCK_OFFERINGS = [
  { id: '1', code: 'CS201', name: 'Database Management Systems', students: 64, progress: 85 },
  { id: '2', code: 'CS202', name: 'Software Engineering', students: 58, progress: 60 },
  { id: '3', code: 'CS203', name: 'Machine Learning', students: 60, progress: 40 },
];

export default function FacultyOfferingsPage() {
  return (
    <ShellLayout role="faculty">
      <Head>
        <title>My Offerings | Faculty Portal</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Course Offerings</h1>
          <p className="text-sm text-gray-500">Manage your courses, students, and grading.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {MOCK_OFFERINGS.map((offering) => (
            <Card key={offering.id} className="p-0 overflow-hidden hover:shadow-xl transition-all">
              <div className="p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold uppercase rounded">Fall 2023</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{offering.code}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{offering.name}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Enrolled Students</p>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-brand-600" />
                        <span className="font-bold text-gray-900">{offering.students}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Current Phase</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <CheckCircle size={16} className="text-green-500" />
                        Midterm
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-gray-400">Course Progress</span>
                        <span className="text-brand-600">{offering.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-600 rounded-full transition-all duration-1000" 
                          style={{ width: `${offering.progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-3 justify-center md:border-l border-gray-100 md:pl-8">
                  <Link href="/faculty/marks">
                    <Button variant="primary" className="w-full">
                      <FileText size={16} />
                      Enter Marks
                    </Button>
                  </Link>
                  <Button variant="secondary" className="w-full">
                    <BarChart3 size={16} />
                    Analytics
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full">
                    <Settings size={14} />
                    Settings
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ShellLayout>
  );
}
