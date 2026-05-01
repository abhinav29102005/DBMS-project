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

  // ... (DataTable columns and mobileCard stay the same)

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
