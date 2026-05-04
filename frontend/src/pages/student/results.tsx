import { ShellLayout } from '@/components/layout/ShellLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card } from '@/components/ui/Card';
import { ColumnDef } from '@tanstack/react-table';
import { GraduationCap, Download, Filter } from 'lucide-react';
import Head from 'next/head';
import { useState, useEffect } from 'react';

import { useStudentResults } from '@/hooks/useStudent';
import { useSemesters } from '@/hooks/useAcademic';
import { Loading } from '@/components/feedback/Loading';

import { ErrorState } from '@/components/feedback/ErrorState';
import { exportToPDF } from '@/lib/pdfExport';

export default function ResultsPage() {
  const { data: semesters } = useSemesters();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | undefined>(undefined);
  
  const { data: results, isLoading, isError, refetch } = useStudentResults(selectedSemesterId);

  if (isError) return <ShellLayout role="student"><ErrorState onRetry={refetch} /></ShellLayout>;

  useEffect(() => {
    if (semesters && semesters.length > 0 && !selectedSemesterId) {
      const current = semesters.find(s => s.isCurrent) || semesters[0];
      setSelectedSemesterId(current.id);
    }
  }, [semesters, selectedSemesterId]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'courseCode', header: 'Code' },
    { accessorKey: 'title', header: 'Course' },
    { accessorKey: 'credits', header: 'Credits' },
    { 
      accessorKey: 'marksInternal', 
      header: 'Internal',
      cell: ({ row }) => row.original.marksInternal ?? '-'
    },
    { 
      accessorKey: 'marksExternal', 
      header: 'External',
      cell: ({ row }) => row.original.marksExternal ?? '-'
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ row }) => (
        <span className="font-bold text-brand-600">{row.original.grade || '-'}</span>
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
  ];

  const mobileCard = (result: any) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{result.courseCode}</span>
          <h4 className="font-bold text-gray-900">{result.title}</h4>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          result.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {result.status || 'Pending'}
        </span>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">Grade</span>
          <span className="font-bold text-brand-600">{result.grade || '-'}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-gray-400 uppercase">Total Marks</span>
          <span className="font-bold text-gray-900">{(result.marksInternal || 0) + (result.marksExternal || 0)}</span>
        </div>
      </div>
    </Card>
  );

  const handleExport = async () => {
    if (!results) return;
    await exportToPDF({
      title: 'Academic Results Marksheet',
      filename: `marksheet-${selectedSemesterId}`,
      headers: ['Code', 'Course', 'Credits', 'Internal', 'External', 'Grade', 'Status', 'Verification'],
      data: results.map((r: any) => [
        r.courseCode,
        r.title,
        r.credits,
        r.marksInternal ?? '-',
        r.marksExternal ?? '-',
        r.grade || '-',
        r.status || 'Pending',
        `VERIFY-RESULT-${r.courseCode}-${selectedSemesterId}` // QR Data
      ]),
      qrDataIndex: 7
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ShellLayout role="student">
      <Head>
        <title>Examination Results | Student Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Academic Results</h1>
            <p className="text-sm text-gray-500 mt-1">Detailed performance analysis and grade tracking.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-brand-200 transition-all active:scale-95"
            >
              <Download size={18} /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 rounded-2xl text-sm font-bold text-white hover:bg-brand-700 shadow-xl shadow-brand-500/20 transition-all active:scale-95"
            >
              Print Marksheet
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          {semesters?.map((sem: any) => (
            <button
              key={sem.id}
              onClick={() => setSelectedSemesterId(sem.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedSemesterId === sem.id
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {sem.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <DataTable
            data={results || []}
            columns={columns}
            mobileCard={mobileCard}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-brand-50 border-brand-100" title="Semester Summary" icon={GraduationCap}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Courses Cleared</span>
                <span className="text-xl font-bold text-brand-700">
                  {results?.filter((r: any) => r.status === 'Pass').length || 0} / {results?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credits Earned</span>
                <span className="text-xl font-bold text-brand-700">
                  {results?.filter((r: any) => r.status === 'Pass').reduce((acc: number, r: any) => acc + (r.credits || 0), 0) || 0}
                </span>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-2" title="Performance Analysis">
             <div className="h-40 flex items-end gap-4 px-2">
              {results?.map((r: any, i: number) => {
                const total = (r.marksInternal || 0) + (r.marksExternal || 0);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      className="w-full bg-brand-100 rounded-t-lg group-hover:bg-brand-500 transition-colors relative"
                      style={{ height: `${Math.min(total, 100)}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {total}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{r.courseCode}</span>
                  </div>
                );
              })}
              {(!results || results.length === 0) && (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No data available for this semester
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ShellLayout>
  );
}
