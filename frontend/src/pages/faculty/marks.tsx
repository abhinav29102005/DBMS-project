import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { Search, Upload, CheckCircle2, User, Loader2 } from 'lucide-react';
import Head from 'next/head';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useOfferingStudents } from '@/hooks/useFaculty';
import { MarksEntryForm } from '@/components/forms/MarksEntryForm';
import { ErrorState } from '@/components/feedback/ErrorState';

export default function MarksEntryPage() {
  const router = useRouter();
  const offeringId = router.query.offeringId as string;
  const { data: students, isLoading, isError, refetch } = useOfferingStudents(offeringId);
  
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((s: any) => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.student_no.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'student_no', header: 'ID' },
    { accessorKey: 'name', header: 'Student Name' },
    {
      accessorKey: 'grade',
      header: 'Current Grade',
      cell: ({ row }) => (
        <span className="font-bold text-brand-600">{row.original.grade || '—'}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.original.status === 'Pass' ? 'bg-green-100 text-green-700' : 
          row.original.status === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {row.original.status || 'Pending'}
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
          Enter Marks
        </Button>
      )
    }
  ];

  const mobileCard = (student: any) => (
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
            <p className="text-xs text-gray-400">{student.student_no}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{student.grade || '—'}</div>
          <span className={`text-[10px] font-bold uppercase ${
            student.status === 'Pass' ? 'text-green-600' : 
            student.status === 'Fail' ? 'text-red-600' : 'text-gray-400'
          }`}>
            {student.status || 'Pending'}
          </span>
        </div>
      </div>
    </Card>
  );

  if (!offeringId) {
    return (
      <ShellLayout role="faculty">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <p className="text-gray-500 font-medium">Please select a course offering first.</p>
          <Button onClick={() => router.push('/faculty/offerings')}>View My Offerings</Button>
        </div>
      </ShellLayout>
    );
  }

  if (isError) return <ShellLayout role="faculty"><ErrorState onRetry={refetch} /></ShellLayout>;

  return (
    <ShellLayout role="faculty">
      <Head>
        <title>Marks Entry | Faculty Portal</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marks Entry</h1>
            <p className="text-sm text-gray-500">Update student assessment and grades</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">
              <Upload size={16} />
              Export List
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
            <Input 
              placeholder="Search students by name or ID..." 
              className="pl-12" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-brand-600" size={32} />
          </div>
        ) : (
          <DataTable
            data={filteredStudents}
            columns={columns}
            mobileCard={mobileCard}
          />
        )}

        <Drawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Update Student Marks"
        >
          {selectedStudent && (
            <MarksEntryForm
              studentName={selectedStudent.name}
              studentId={selectedStudent.id}
              offeringId={offeringId}
              onSuccess={() => {
                setIsDrawerOpen(false);
                refetch();
              }}
            />
          )}
        </Drawer>
      </div>
    </ShellLayout>
  );
}
