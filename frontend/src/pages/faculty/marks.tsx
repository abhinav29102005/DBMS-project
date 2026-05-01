import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { Search, Upload, CheckCircle2, User, ChevronRight } from 'lucide-react';
import Head from 'next/head';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface StudentMark {
  id: string;
  studentId: string;
  name: string;
  currentMarks: number;
  status: 'Submitted' | 'Draft';
}

const MOCK_STUDENTS: StudentMark[] = [
  { id: '1', studentId: '2024CS001', name: 'Abhinav Kumar', currentMarks: 85, status: 'Submitted' },
  { id: '2', studentId: '2024CS002', name: 'Rahul Sharma', currentMarks: 72, status: 'Draft' },
  { id: '3', studentId: '2024CS003', name: 'Sneha Gupta', currentMarks: 94, status: 'Submitted' },
  { id: '4', studentId: '2024CS004', name: 'Priya Singh', currentMarks: 0, status: 'Draft' },
  { id: '5', studentId: '2024CS005', name: 'Amit Verma', currentMarks: 68, status: 'Draft' },
];

import { MarksEntryForm } from '@/components/forms/MarksEntryForm';

export default function MarksEntryPage() {
  const [selectedStudent, setSelectedStudent] = useState<StudentMark | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const columns: ColumnDef<StudentMark>[] = [
    { accessorKey: 'studentId', header: 'ID' },
    { accessorKey: 'name', header: 'Student Name' },
    {
      accessorKey: 'currentMarks',
      header: 'Marks',
      cell: ({ row }) => (
        <span className="font-bold">{row.original.currentMarks}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.original.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedStudent(row.original);
            setIsDrawerOpen(true);
          }}
        >
          Edit Marks
        </Button>
      )
    }
  ];

  const mobileCard = (student: StudentMark) => (
    <Card className="p-4" onClick={() => {
      setSelectedStudent(student);
      setIsDrawerOpen(true);
    }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
            <User size={18} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{student.name}</h4>
            <p className="text-xs text-gray-400">{student.studentId}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{student.currentMarks}</div>
          <span className={`text-[10px] font-bold uppercase ${
            student.status === 'Submitted' ? 'text-green-600' : 'text-orange-600'
          }`}>
            {student.status}
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <ShellLayout role="faculty">
      <Head>
        <title>Marks Entry | Faculty Portal</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marks Entry</h1>
            <p className="text-sm text-gray-500">Course: CS201 - Database Management Systems</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">
              <Upload size={16} />
              Bulk Upload (CSV)
            </Button>
            <Button variant="primary" size="md">
              <CheckCircle2 size={16} />
              Finalize & Submit
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="Search students by name or ID..." className="pl-12" />
          </div>
          <Button variant="secondary" className="mobile:hidden">Filter</Button>
        </div>

        <DataTable
          data={MOCK_STUDENTS}
          columns={columns}
          mobileCard={mobileCard}
        />

        <Drawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Update Student Marks"
        >
          {selectedStudent && (
            <MarksEntryForm
              studentName={selectedStudent.name}
              initialMarks={selectedStudent.currentMarks}
              onSuccess={() => setIsDrawerOpen(false)}
            />
          )}
        </Drawer>
      </div>
    </ShellLayout>
  );
}
