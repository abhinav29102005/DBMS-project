import { ShellLayout } from '@/components/layout/ShellLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { Search, UserPlus, FileDown, MoreVertical, Mail, User } from 'lucide-react';
import Head from 'next/head';

interface StudentRecord {
  id: string;
  studentId: string;
  name: string;
  email: string;
  program: string;
  semester: number;
  status: 'Active' | 'On Leave' | 'Graduated';
}

const MOCK_STUDENTS: StudentRecord[] = [
  { id: '1', studentId: '2024CS001', name: 'Abhinav Kumar', email: 'abhinav@university.edu', program: 'B.Tech CSE', semester: 4, status: 'Active' },
  { id: '2', studentId: '2024CS002', name: 'Rahul Sharma', email: 'rahul@university.edu', program: 'B.Tech CSE', semester: 4, status: 'Active' },
  { id: '3', studentId: '2024ME001', name: 'Sneha Gupta', email: 'sneha@university.edu', program: 'B.Tech ME', semester: 2, status: 'Active' },
  { id: '4', studentId: '2024EE005', name: 'Priya Singh', email: 'priya@university.edu', program: 'B.Tech EE', semester: 6, status: 'On Leave' },
  { id: '5', studentId: '2024CS045', name: 'Amit Verma', email: 'amit@university.edu', program: 'B.Tech CSE', semester: 8, status: 'Graduated' },
];

export default function AdminStudentsPage() {
  const columns: ColumnDef<StudentRecord>[] = [
    { accessorKey: 'studentId', header: 'ID' },
    { 
      accessorKey: 'name', 
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs">
            {row.original.name.charAt(0)}
          </div>
          <span className="font-medium text-gray-900">{row.original.name}</span>
        </div>
      )
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'program', header: 'Program' },
    { accessorKey: 'semester', header: 'Sem' },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          row.original.status === 'Active' ? 'bg-green-100 text-green-700' : 
          row.original.status === 'On Leave' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: () => <Button variant="ghost" size="sm"><MoreVertical size={16} /></Button>
    }
  ];

  const mobileCard = (student: StudentRecord) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold">
            {student.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{student.name}</h4>
            <p className="text-xs text-gray-400">{student.studentId}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {student.status}
        </span>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail size={12} />
          {student.email}
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {student.program} • Semester {student.semester}
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-50">
        <Button variant="outline" size="sm" className="flex-1">Profile</Button>
        <Button variant="secondary" size="sm" className="flex-1">Action</Button>
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
            <Button variant="outline">
              <FileDown size={16} />
              Export
            </Button>
            <Button variant="primary">
              <UserPlus size={16} />
              Add Student
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="Search by name, ID, or email..." className="pl-12" />
          </div>
          <Button variant="secondary" className="mobile:hidden">Filters</Button>
        </div>

        <DataTable 
          data={MOCK_STUDENTS} 
          columns={columns} 
          mobileCard={mobileCard} 
        />
      </div>
    </ShellLayout>
  );
}
