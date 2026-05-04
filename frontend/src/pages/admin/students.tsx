import { useState } from 'react';
import { ShellLayout } from '@/components/layout/ShellLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { Search, UserPlus, FileDown, MoreVertical, Mail, User } from 'lucide-react';
import Head from 'next/head';
import { useAllStudents } from '@/hooks/useAdmin';
import { Loading } from '@/components/feedback/Loading';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { adminService } from '@/services/academic/adminService';

interface StudentRecord {
  id: string;
  student_no: string;
  first_name: string;
  last_name: string;
  email: string;
  program_name: string;
  current_semester: number;
}

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const { data: students, isLoading, isError, refetch } = useAllStudents({ search });
  const [isAdding, setIsAdding] = useState(false);

  const columns: ColumnDef<StudentRecord>[] = [
    { accessorKey: 'student_no', header: 'ID' },
    {
      accessorKey: 'name',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs uppercase">
            {row.original.first_name?.charAt(0)}
          </div>
          <span className="font-medium text-gray-900">{row.original.first_name} {row.original.last_name}</span>
        </div>
      )
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'program_name', header: 'Program' },
    { accessorKey: 'current_semester', header: 'Sem' },
    {
      id: 'actions',
      header: '',
      cell: () => <Button variant="ghost" size="sm"><MoreVertical size={16} /></Button>
    }
  ];

  const [studentData, setStudentData] = useState({
    firstName: '', lastName: '', email: '', studentNo: '', 
    programId: '', departmentId: '', admissionYear: 2024, currentSemester: 1 
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await adminService.createStudent(studentData);
      toast.success('Student added successfully');
      setIsAdding(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = () => {
    if (!students?.length) return;
    const headers = ['Student ID', 'First Name', 'Last Name', 'Email', 'Program', 'Semester'];
    const rows = students.map(s => [s.student_no, s.first_name, s.last_name, s.email, s.program_name, s.current_semester]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "students_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mobileCard = (student: StudentRecord) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold uppercase">
            {student.first_name?.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{student.first_name} {student.last_name}</h4>
            <p className="text-xs text-gray-400">{student.student_no}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail size={12} />
          {student.email}
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {student.program_name} • Semester {student.current_semester}
        </div>
      </div>
    </Card>
  );

  return (
    <ShellLayout role="admin">
      <Head>
        <title>Student Records | Admin Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Management</h1>
            <p className="text-sm text-gray-500">View, search, and manage university student records.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={isLoading || !students?.length}>
              <FileDown size={16} />
              Export
            </Button>
            <Button variant="primary" onClick={() => setIsAdding(true)}>
              <UserPlus size={16} />
              Add Student
            </Button>
          </div>
        </div>

        {/* Add Student Modal */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl bg-white p-8">
              <h3 className="text-2xl font-bold mb-6">Register New Student</h3>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">First Name</label>
                  <Input value={studentData.firstName} onChange={e => setStudentData({...studentData, firstName: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Name</label>
                  <Input value={studentData.lastName} onChange={e => setStudentData({...studentData, lastName: e.target.value})} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                  <Input type="email" value={studentData.email} onChange={e => setStudentData({...studentData, email: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Student No (Roll No)</label>
                  <Input value={studentData.studentNo} onChange={e => setStudentData({...studentData, studentNo: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Department ID (UUID)</label>
                  <Input value={studentData.departmentId} onChange={e => setStudentData({...studentData, departmentId: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Program ID (UUID)</label>
                  <Input value={studentData.programId} onChange={e => setStudentData({...studentData, programId: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Current Semester</label>
                  <Input type="number" value={studentData.currentSemester} onChange={e => setStudentData({...studentData, currentSemester: parseInt(e.target.value)})} required />
                </div>
                <div className="col-span-2 flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" loading={formLoading}>Add Student</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search by name, ID, or email..." 
              className="pl-12" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="mobile:hidden">Filters</Button>
        </div>

        {isLoading ? <Loading /> : (
          <DataTable
            data={students || []}
            columns={columns}
            mobileCard={mobileCard}
          />
        )}
      </div>
    </ShellLayout>
  );
}
