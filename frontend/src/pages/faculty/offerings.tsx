import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, Users, FileText, CheckCircle, BarChart3, Settings, Loader2, Search } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useFacultyOfferings } from '@/hooks/useFaculty';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useState, useMemo } from 'react';

export default function FacultyOfferingsPage() {
  const { data: offerings, isLoading, isError, refetch } = useFacultyOfferings();
  const [search, setSearch] = useState('');

  const filteredOfferings = useMemo(() => {
    if (!offerings) return [];
    return (offerings as any[]).filter((o: any) => 
      o.title.toLowerCase().includes(search.toLowerCase()) || 
      o.course_code.toLowerCase().includes(search.toLowerCase())
    );
  }, [offerings, search]);

  if (isLoading) {
    return (
      <ShellLayout role="faculty">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-brand-600" size={48} />
        </div>
      </ShellLayout>
    );
  }

  if (isError) return <ShellLayout role="faculty"><ErrorState onRetry={refetch} /></ShellLayout>;

  return (
    <ShellLayout role="faculty">
      <Head>
        <title>My Offerings | Faculty Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Course Offerings</h1>
            <p className="text-sm text-gray-500">Manage your courses, students, and grading.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Filter courses by name or code..." 
              className="pl-12 h-12 rounded-2xl bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm focus:shadow-md transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredOfferings.map((offering: any) => (
            <Card key={offering.id} className="p-0 overflow-hidden hover:shadow-xl transition-all border-none shadow-brand-500/5">
              <div className="p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold uppercase rounded">{offering.semester_name || 'Current Term'}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{offering.course_code}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{offering.title}</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Enrolled Students</p>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-brand-600" />
                        <span className="font-bold text-gray-900">{offering.enrollment_count || 0}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <CheckCircle size={16} className="text-green-500" />
                        {offering.status || 'Active'}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-gray-400">Credits</span>
                        <span className="text-brand-600">{offering.credits}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all duration-1000"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 justify-center md:border-l border-gray-100 md:pl-8">
                  <Link href={`/faculty/marks?offeringId=${offering.id}`}>
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
