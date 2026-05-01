import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Book, Search, Plus, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';

interface BookRecord {
  id: string;
  isbn: string;
  title: string;
  author: string;
  copies: number;
  available: number;
}

const MOCK_BOOKS: BookRecord[] = [
  { id: '1', isbn: '978-0131103627', title: 'The C Programming Language', author: 'Kernighan & Ritchie', copies: 12, available: 5 },
  { id: '2', isbn: '978-0262033848', title: 'Introduction to Algorithms', author: 'Cormen et al.', copies: 25, available: 12 },
  { id: '3', isbn: '978-0132350884', title: 'Clean Code', author: 'Robert C. Martin', copies: 15, available: 0 },
  { id: '4', isbn: '978-0596007126', title: 'Head First Design Patterns', author: 'Eric Freeman', copies: 10, available: 8 },
];

export default function AdminLibraryPage() {
  const columns: ColumnDef<BookRecord>[] = [
    { accessorKey: 'isbn', header: 'ISBN' },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'author', header: 'Author' },
    { accessorKey: 'copies', header: 'Total' },
    {
      accessorKey: 'available',
      header: 'Available',
      cell: ({ row }) => (
        <span className={`font-bold ${row.original.available === 0 ? 'text-red-500' : 'text-green-600'}`}>
          {row.original.available}
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: () => <Button variant="ghost" size="sm">Manage</Button>
    }
  ];

  const mobileCard = (book: BookRecord) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-900">{book.title}</h4>
          <p className="text-xs text-gray-400">{book.author}</p>
        </div>
        <div className="text-right">
          <div className={`text-lg font-black ${book.available === 0 ? 'text-red-500' : 'text-green-600'}`}>
            {book.available}
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-bold">Left</p>
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-50">
        <Button variant="outline" size="sm" className="flex-1">Issue</Button>
        <Button variant="secondary" size="sm" className="flex-1">Edit</Button>
      </div>
    </Card>
  );

  return (
    <ShellLayout role="admin">
      <Head>
        <title>Library Management | Admin Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Library Management</h1>
            <p className="text-sm text-gray-500">Inventory, book issues, and fine management.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Fine Logs</Button>
            <Button variant="primary">
              <Plus size={16} />
              Add Book
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Inventory" subtitle="Books & Media" icon={Book}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">4,282</span>
            </div>
          </Card>
          <Card title="Active Issues" subtitle="Checked out" icon={CheckCircle2}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-brand-600">842</span>
            </div>
          </Card>
          <Card title="Overdue Books" subtitle="Pending return" icon={AlertTriangle}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-red-500">54</span>
            </div>
          </Card>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="Search books by title, author, or ISBN..." className="pl-12" />
          </div>
          <Button variant="secondary">
            <Filter size={16} />
            Filter
          </Button>
        </div>

        <DataTable
          data={MOCK_BOOKS}
          columns={columns}
          mobileCard={mobileCard}
        />
      </div>
    </ShellLayout>
  );
}
