import { ShellLayout } from '@/components/layout/ShellLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card } from '@/components/ui/Card';
import { ColumnDef } from '@tanstack/react-table';
import { GraduationCap, Download, Filter } from 'lucide-react';
import Head from 'next/head';
import { useState } from 'react';

interface Result {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  marks: number;
  status: 'Pass' | 'Fail' | 'Pending';
}

const MOCK_RESULTS: Result[] = [
  { id: '1', courseCode: 'CS101', courseName: 'Introduction to Programming', credits: 4, grade: 'A', marks: 88, status: 'Pass' },
  { id: '2', courseCode: 'CS102', courseName: 'Data Structures', credits: 4, grade: 'B+', marks: 78, status: 'Pass' },
  { id: '3', courseCode: 'MA101', courseName: 'Calculus I', credits: 3, grade: 'A-', marks: 82, status: 'Pass' },
  { id: '4', courseCode: 'PH101', courseName: 'Engineering Physics', credits: 3, grade: 'B', marks: 72, status: 'Pass' },
  { id: '5', courseCode: 'CS201', courseName: 'Database Systems', credits: 4, grade: 'A', marks: 92, status: 'Pass' },
];

export default function ResultsPage() {
  const [semester, setSemester] = useState('Fall 2023');

  const columns: ColumnDef<Result>[] = [
    { accessorKey: 'courseCode', header: 'Code' },
    { accessorKey: 'courseName', header: 'Course' },
    { accessorKey: 'credits', header: 'Credits' },
    { accessorKey: 'marks', header: 'Marks' },
    { 
      accessorKey: 'grade', 
      header: 'Grade',
      cell: ({ row }) => (
        <span className="font-bold text-brand-600">{row.original.grade}</span>
      )
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.original.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.original.status}
        </span>
      )
    },
  ];

  const mobileCard = (result: Result) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{result.courseCode}</span>
          <h4 className="font-bold text-gray-900">{result.courseName}</h4>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          result.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {result.status}
        </span>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">Grade</span>
          <span className="font-bold text-brand-600">{result.grade}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-gray-400 uppercase">Marks</span>
          <span className="font-bold text-gray-900">{result.marks}/100</span>
        </div>
      </div>
    </Card>
  );

  return (
    <ShellLayout role="student">
      <Head>
        <title>Examination Results | Student Portal</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Results</h1>
            <p className="text-sm text-gray-500">View and download your semester-wise performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Export PDF
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 rounded-xl text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95">
              Print Marksheet
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          {['Fall 2023', 'Spring 2023', 'Fall 2022', 'Spring 2022'].map((sem) => (
            <button
              key={sem}
              onClick={() => setSemester(sem)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                semester === sem 
                  ? 'bg-brand-50 text-brand-700 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        <DataTable 
          data={MOCK_RESULTS} 
          columns={columns} 
          mobileCard={mobileCard} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-brand-50 border-brand-100" title="Semester Summary" icon={GraduationCap}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SGPA</span>
                <span className="text-xl font-bold text-brand-700">3.85</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credits Earned</span>
                <span className="text-xl font-bold text-brand-700">18 / 18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rank in Class</span>
                <span className="text-xl font-bold text-brand-700">#4</span>
              </div>
            </div>
          </Card>
          
          <Card className="md:col-span-2" title="Performance Analysis">
            <div className="h-40 flex items-end gap-4 px-2">
              {[45, 78, 62, 85, 92, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-brand-100 rounded-t-lg group-hover:bg-brand-500 transition-colors relative"
                    style={{ height: `${h}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">CS{i+101}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ShellLayout>
  );
}
