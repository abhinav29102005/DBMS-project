import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStudentEnrollments } from '@/hooks/useStudent';
import { Loading } from '@/components/feedback/Loading';
import { BookOpen, User, MapPin, Clock, Search } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';

import { ErrorState } from '@/components/feedback/ErrorState';

import { useStudentEnrollments, useAvailableOfferings, useEnrollCourse } from '@/hooks/useStudent';
import { Loading } from '@/components/feedback/Loading';
import { BookOpen, User, MapPin, Clock, Search, Plus, CheckCircle2 } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/ErrorState';

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: enrollments, isLoading, isError, refetch } = useStudentEnrollments();
  const { data: offerings, isLoading: isLoadingOfferings } = useAvailableOfferings();
  const enrollMutation = useEnrollCourse();

  if (isLoading) return <ShellLayout role="student"><Loading fullScreen /></ShellLayout>;
  if (isError) return <ShellLayout role="student"><ErrorState onRetry={refetch} /></ShellLayout>;

  const handleEnroll = async (offeringId: string) => {
    try {
      await enrollMutation.mutateAsync(offeringId);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Enrollment failed:', err);
    }
  };

  return (
    <ShellLayout role="student">
      <Head>
        <title>My Courses | Student Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Courses</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your current academic enrollments.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search courses..." className="pl-9 py-2.5 text-sm w-64" />
            </div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus size={18} /> Register New
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {enrollments?.length === 0 ? (
            <Card className="lg:col-span-2 py-20 text-center">
              <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No Courses Found</h3>
              <p className="text-gray-500 mt-2">You are not enrolled in any courses for this semester.</p>
              <Button variant="outline" className="mt-6" onClick={() => setIsModalOpen(true)}>Start Registration</Button>
            </Card>
          ) : (
            enrollments?.map((enrollment: any) => (
              <Card key={enrollment.id} className="group hover:border-brand-500 transition-all hover:shadow-2xl hover:shadow-brand-500/10 border-2 border-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen size={100} />
                </div>
                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                    <BookOpen size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-1 rounded-md">{enrollment.courseCode}</span>
                      <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{enrollment.credits} Credits</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-5 group-hover:text-brand-700 transition-colors leading-tight">{enrollment.title}</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex items-center gap-2.5 text-sm text-gray-600 font-semibold">
                        <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-brand-50 transition-colors">
                          <User size={14} className="text-brand-500" />
                        </div>
                        {enrollment.facultyName || 'TBA'}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-gray-600 font-semibold">
                        <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-brand-50 transition-colors">
                          <MapPin size={14} className="text-brand-500" />
                        </div>
                        {enrollment.room || 'TBA'}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-gray-600 font-semibold sm:col-span-2">
                        <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-brand-50 transition-colors">
                          <Clock size={14} className="text-brand-500" />
                        </div>
                        Section: {enrollment.sectionCode}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center relative z-10">
                  <button className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1.5">
                    View Syllabus
                  </button>
                  <Button variant="ghost" size="sm" className="font-bold text-gray-500">Course Content</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Courses"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 font-medium">Available course offerings for your program this semester:</p>
          
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {isLoadingOfferings ? (
              <div className="py-10 text-center"><Loading /></div>
            ) : offerings?.length === 0 ? (
              <div className="py-10 text-center text-gray-500 font-medium">No available offerings found.</div>
            ) : (
              offerings?.map((offering: any) => (
                <div key={offering.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between hover:border-brand-300 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{offering.courseCode}</span>
                        <span className="text-[10px] font-bold text-gray-400">•</span>
                        <span className="text-[10px] font-bold text-gray-500">{offering.credits} Credits</span>
                      </div>
                      <h4 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{offering.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">Prof. {offering.facultyName || 'TBA'}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-xl px-4"
                    onClick={() => handleEnroll(offering.id)}
                    isLoading={enrollMutation.isPending && enrollMutation.variables === offering.id}
                  >
                    Enroll
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </ShellLayout>
  );
}
