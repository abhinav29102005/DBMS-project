
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useProfileStatus, useSetupStudentProfile, useSetupFacultyProfile } from '@/hooks/useProfile';
import { useDepartments, usePrograms } from '@/hooks/useAcademic';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/feedback/Loading';
import { GraduationCap, Briefcase, ChevronRight, User } from 'lucide-react';
import Head from 'next/head';

export default function ProfileSetupPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const { data: status, isLoading: statusLoading } = useProfileStatus();
  const { data: departments } = useDepartments();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    studentNo: '',
    employeeNo: '',
    departmentId: '',
    programId: '',
    admissionYear: new Date().getFullYear(),
    currentSemester: 1,
    designation: 'Assistant Professor',
    specialization: ''
  });

  const { data: programs } = usePrograms(formData.departmentId || undefined);

  const studentMutation = useSetupStudentProfile();
  const facultyMutation = useSetupFacultyProfile();

  useEffect(() => {
    if (status?.isComplete) {
      router.push(`/${status.role}/dashboard`);
    }
  }, [status, router]);

  if (statusLoading) return <Loading fullScreen />;

  const handleNext = () => setStep(2);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user?.role === 'student') {
        await studentMutation.mutateAsync({
          studentNo: formData.studentNo,
          departmentId: formData.departmentId,
          programId: formData.programId,
          admissionYear: formData.admissionYear,
          currentSemester: formData.currentSemester
        });
        router.push('/student/dashboard');
      } else if (user?.role === 'faculty') {
        await facultyMutation.mutateAsync({
          employeeNo: formData.employeeNo,
          departmentId: formData.departmentId,
          designation: formData.designation,
          specialization: formData.specialization
        });
        router.push('/faculty/dashboard');
      }
    } catch (err) {
      console.error('Setup failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Head>
        <title>Complete Your Profile | UIMS</title>
      </Head>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
            <User size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Complete Your Profile</h1>
          <p className="mt-2 text-gray-500">We need a few more details to set up your account.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Institutional ID</label>
                  <Input 
                    placeholder={user?.role === 'student' ? "Student ID (e.g. 2024CS001)" : "Employee ID (e.g. EMP101)"}
                    value={user?.role === 'student' ? formData.studentNo : formData.employeeNo}
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      [user?.role === 'student' ? 'studentNo' : 'employeeNo']: e.target.value 
                    }))}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Department</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all appearance-none"
                    value={formData.departmentId}
                    onChange={e => setFormData(prev => ({ ...prev, departmentId: e.target.value, programId: '' }))}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments?.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <Button 
                  type="button" 
                  className="w-full" 
                  onClick={handleNext}
                  disabled={!formData.departmentId || (!formData.studentNo && !formData.employeeNo)}
                >
                  Continue <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {user?.role === 'student' ? (
                  <>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">Degree Program</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all appearance-none"
                        value={formData.programId}
                        onChange={e => setFormData(prev => ({ ...prev, programId: e.target.value }))}
                        required
                      >
                        <option value="">Select Program</option>
                        {programs?.map(prog => (
                          <option key={prog.id} value={prog.id}>{prog.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Admission Year</label>
                        <Input 
                          type="number"
                          value={formData.admissionYear}
                          onChange={e => setFormData(prev => ({ ...prev, admissionYear: parseInt(e.target.value) }))}
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Current Semester</label>
                        <Input 
                          type="number"
                          min={1}
                          max={12}
                          value={formData.currentSemester}
                          onChange={e => setFormData(prev => ({ ...prev, currentSemester: parseInt(e.target.value) }))}
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">Designation</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all appearance-none"
                        value={formData.designation}
                        onChange={e => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                        required
                      >
                        {['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Faculty', 'Adjunct Faculty'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">Specialization</label>
                      <Input 
                        placeholder="e.g. Distributed Systems, Quantum Computing"
                        value={formData.specialization}
                        onChange={e => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button 
                    type="submit" 
                    className="flex-[2]"
                    disabled={studentMutation.isPending || facultyMutation.isPending}
                  >
                    {studentMutation.isPending || facultyMutation.isPending ? 'Saving...' : 'Finish Setup'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
