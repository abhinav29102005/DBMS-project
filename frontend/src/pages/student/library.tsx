import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Book, Search, Clock, AlertCircle, History } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';

interface BookIssue {
  id: string;
  title: string;
  author: string;
  issueDate: string;
  dueDate: string;
  status: 'Issued' | 'Overdue';
}

const MOCK_ISSUES: BookIssue[] = [
  { id: '1', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest', issueDate: '2024-04-10', dueDate: '2024-05-10', status: 'Issued' },
  { id: '2', title: 'Clean Code', author: 'Robert C. Martin', issueDate: '2024-03-15', dueDate: '2024-04-15', status: 'Overdue' },
];

export default function StudentLibraryPage() {
  const columns: ColumnDef<BookIssue>[] = [
    { accessorKey: 'title', header: 'Book Title' },
    { accessorKey: 'author', header: 'Author' },
    { accessorKey: 'dueDate', header: 'Due Date' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.original.status === 'Issued' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: () => <Button variant="ghost" size="sm">Renew</Button>
    }
  ];

  const mobileCard = (book: BookIssue) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-900 leading-tight">{book.title}</h4>
          <p className="text-xs text-gray-400">{book.author}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          book.status === 'Issued' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
        }`}>
          {book.status}
        </span>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">Due Date</span>
          <span className="text-sm font-bold text-gray-700">{book.dueDate}</span>
        </div>
        <Button variant="secondary" size="sm">Renew</Button>
      </div>
    </Card>
  );

  return (
    <ShellLayout role="student">
      <Head>
        <title>Library Services | Student Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">University Library</h1>
            <p className="text-sm text-gray-500">Search books and manage your issues.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search catalog..." className="pl-9 py-2 text-sm min-w-[280px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card title="Books Issued" subtitle="Current term" icon={Book} className="lg:col-span-1">
            <div className="mt-2">
              <span className="text-4xl font-black text-gray-900">2</span>
              <span className="ml-2 text-sm text-gray-500">/ 5 Limit</span>
            </div>
          </Card>
          <Card title="Pending Fines" subtitle="Overdue books" icon={AlertCircle} className="lg:col-span-1">
            <div className="mt-2">
              <span className="text-4xl font-black text-red-600">$5.50</span>
              <span className="ml-2 text-sm text-red-500">Urgent</span>
            </div>
          </Card>
          <Card title="Total Visits" subtitle="This month" icon={History} className="lg:col-span-1">
            <div className="mt-2">
              <span className="text-4xl font-black text-gray-900">12</span>
            </div>
          </Card>
          <Card title="Active Days" subtitle="Consistent study" icon={Clock} className="lg:col-span-1">
            <div className="mt-2 text-4xl font-black text-brand-600">8</div>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Current Issues</h2>
          <DataTable
            data={MOCK_ISSUES}
            columns={columns}
            mobileCard={mobileCard}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Suggested for You">
            <div className="space-y-4">
              {[
                { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', year: '2019' },
                { title: 'Design Patterns', author: 'GoF', year: '1994' },
                { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', year: '2014' },
              ].map((book, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="h-12 w-10 bg-gray-100 rounded-md group-hover:bg-brand-100 transition-colors" />
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{book.title}</h5>
                    <p className="text-[10px] text-gray-500">{book.author} • {book.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Library Hours">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Monday - Friday</span>
                <span className="font-bold text-gray-900">08:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between border-t border-gray-50 pt-3">
                <span className="text-gray-500">Saturday</span>
                <span className="font-bold text-gray-900">09:00 AM - 06:00 PM</span>
              </div>
              <div className="flex justify-between border-t border-gray-50 pt-3">
                <span className="text-gray-500">Sunday</span>
                <span className="font-bold text-red-500">Closed</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ShellLayout>
  );
}
