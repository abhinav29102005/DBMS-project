import { useState, useEffect } from 'react';
import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Book, Search, Plus, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { useLibraryStats } from '@/hooks/useAdmin';
import { libraryService } from '@/services/library/libraryService';
import { Loading } from '@/components/feedback/Loading';
import { ErrorState } from '@/components/feedback/ErrorState';
import { AddBookModal } from '@/components/admin/library/AddBookModal';

interface BookRecord {
  id: string;
  isbn: string;
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
  pdf_url?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function AdminLibraryPage() {
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('all');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: stats, isLoading: isLoadingStats, isError, refetch } = useLibraryStats();

  const loadInitialData = async () => {
    try {
      const subData = await libraryService.getSubjects();
      setSubjects(subData);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const data = await libraryService.getBooks(search, subjectId === 'all' ? undefined : subjectId);
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadBooks, 500);
    return () => clearTimeout(timer);
  }, [search, subjectId]);

  const columns: ColumnDef<BookRecord>[] = [
    { accessorKey: 'isbn', header: 'ISBN' },
    { 
      accessorKey: 'title', 
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-gray-900">{row.original.title}</div>
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
            {(row.original as any).subject_name || 'General'}
          </div>
        </div>
      )
    },
    { accessorKey: 'author', header: 'Author' },
    { accessorKey: 'total_copies', header: 'Total' },
    {
      accessorKey: 'available_copies',
      header: 'Available',
      cell: ({ row }) => (
        <span className={`font-bold ${row.original.available_copies === 0 ? 'text-red-500' : 'text-green-600'}`}>
          {row.original.available_copies}
        </span>
      )
    },
    {
      accessorKey: 'pdf_url',
      header: 'Digital Copy',
      cell: ({ row }) => row.original.pdf_url ? (
        <a 
          href={row.original.pdf_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full transition-all"
        >
          Read <Search size={12} />
        </a>
      ) : (
        <span className="text-xs text-gray-300 font-medium italic">Physical Only</span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: () => <Button variant="ghost" size="sm">Issue</Button>
    }
  ];

  const mobileCard = (book: BookRecord) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-900">{book.title}</h4>
          <p className="text-xs text-gray-400">{book.author}</p>
          <p className="text-[10px] text-brand-600 font-bold uppercase mt-1">{(book as any).subject_name || 'General'}</p>
        </div>
        <div className="text-right">
          <div className={`text-lg font-black ${book.available_copies === 0 ? 'text-red-500' : 'text-green-600'}`}>
            {book.available_copies}
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-bold">Left</p>
        </div>
      </div>
    </Card>
  );

  if (isError) return <ShellLayout role="admin"><ErrorState onRetry={refetch} /></ShellLayout>;

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
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} /> Add Book
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Inventory" subtitle="Books & Media" icon={Book}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{stats?.total_books?.toLocaleString() || 0}</span>
            </div>
          </Card>
          <Card title="Active Issues" subtitle="Checked out" icon={CheckCircle2}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-brand-600">{stats?.active_issues || 0}</span>
            </div>
          </Card>
          <Card title="Overdue Books" subtitle="Pending return" icon={AlertTriangle}>
            <div className="mt-2">
              <span className="text-3xl font-bold text-red-500">{stats?.overdue_books || 0}</span>
            </div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search books by title, author, or ISBN..." 
              className="pl-12" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="h-12 px-4 rounded-2xl border border-gray-100 bg-white text-sm font-medium focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
          >
            <option value="all">All Categories</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <Button variant="secondary">Filter</Button>
        </div>

        {isLoadingBooks ? <Loading /> : (
          <DataTable
            data={books}
            columns={columns}
            mobileCard={mobileCard}
          />
        )}

        <AddBookModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onRefresh={loadBooks} 
        />
      </div>
    </ShellLayout>
  );
}
