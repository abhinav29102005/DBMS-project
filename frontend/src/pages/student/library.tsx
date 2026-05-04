import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Book, Search, Clock, AlertCircle, History, BookOpen, ExternalLink, Filter } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { QRCodeCanvas } from 'qrcode.react';
import { exportToPDF } from '@/lib/pdfExport';
import { useState, useEffect } from 'react';
import { useStudentLibrary } from '@/hooks/useStudent';
import { libraryService } from '@/services/library/libraryService';
import { Loading } from '@/components/feedback/Loading';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PDFViewer } from '@/components/library/PDFViewer';

export default function StudentLibraryPage() {
  const { data: issues, isLoading: isLoadingIssues, isError, refetch } = useStudentLibrary();
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('all');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [viewingBook, setViewingBook] = useState<{url: string, title: string} | null>(null);
  
  const queryClient = useQueryClient();

  const loadCatalog = async () => {
    setIsLoadingBooks(true);
    try {
      const [bookData, subData] = await Promise.all([
        libraryService.getBooks(search, subjectId === 'all' ? undefined : subjectId),
        libraryService.getSubjects()
      ]);
      setBooks(bookData);
      setSubjects(subData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadCatalog, 500);
    return () => clearTimeout(timer);
  }, [search, subjectId]);

  if (isError) return <ShellLayout role="student"><ErrorState onRetry={refetch} /></ShellLayout>;

  const handleReturn = async (id: string) => {
    try {
      await apiFetch.patch(`/api/v1/library/issues/${id}/return`);
      toast.success('Book returned successfully');
      queryClient.invalidateQueries({ queryKey: ['student', 'library'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to return book');
    }
  };

  const handleIssue = async (bookId: string) => {
    try {
      await libraryService.issueBook({ bookId });
      toast.success('Book issued successfully! It is now in your Current Issues list.');
      queryClient.invalidateQueries({ queryKey: ['student', 'library'] });
      loadCatalog(); // Refresh availability
    } catch (err: any) {
      toast.error(err.message || 'Failed to issue book');
    }
  };

  const catalogColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'title', 
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-gray-900">{row.original.title}</div>
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{row.original.subject_name || 'General'}</div>
        </div>
      )
    },
    { accessorKey: 'author', header: 'Author' },
    {
      accessorKey: 'available_copies',
      header: 'Availability',
      cell: ({ row }) => (
        <span className={`font-bold ${row.original.available_copies === 0 ? 'text-red-500' : 'text-green-600'}`}>
          {row.original.available_copies} Available
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.pdf_url && (
            <Button 
              variant="primary" 
              size="sm" 
              className="gap-2"
              onClick={() => setViewingBook({ url: row.original.pdf_url, title: row.original.title })}
            >
              <BookOpen size={14} /> Read
            </Button>
          )}
          <Button variant="ghost" size="sm" disabled={row.original.available_copies === 0} onClick={() => handleIssue(row.original.id)}>
            Issue
          </Button>
        </div>
      )
    }
  ];

  return (
    <ShellLayout role="student">
      <Head>
        <title>Library Services | Student Portal</title>
      </Head>

      <div className="space-y-8 pb-20">
        {}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-brand-600 p-10 text-white shadow-2xl shadow-brand-500/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h1 className="text-4xl font-black mb-3 tracking-tight">University Library</h1>
              <p className="text-brand-100 font-medium">Access over 10,000 digital titles and manage your physical issues from one unified portal.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 text-center border border-white/10">
                <div className="text-3xl font-black">{issues?.filter((i: any) => i.status === 'issued').length || 0}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-200">Active Issues</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 text-center border border-white/10">
                <div className="text-3xl font-black text-orange-300">0</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-200">Pending Fines</div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Book size={240} />
          </div>
        </section>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Book Catalog</h2>
                <div className="flex gap-3">
                  <div className="relative flex-1 md:min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      placeholder="Search title, author, or ISBN..." 
                      className="pl-12 h-12 rounded-2xl bg-gray-50 border-0" 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <select 
                    className="h-12 px-4 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none"
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                  >
                    <option value="all">All Genres</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {isLoadingBooks ? <Loading /> : (
                <DataTable
                  data={books || []}
                  columns={catalogColumns}
                  mobileCard={(book) => (
                    <Card className="p-5 border-gray-50 hover:border-brand-200 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                            <Book size={20} className="text-gray-300 group-hover:text-brand-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-tight">{book.title}</h4>
                            <p className="text-xs text-gray-500 font-medium">{book.author}</p>
                            <p className="text-[10px] text-brand-600 font-black uppercase mt-1">{book.subject_name || 'General'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {book.pdf_url && (
                          <Button 
                            className="flex-1 rounded-xl h-10 gap-2" 
                            variant="primary"
                            onClick={() => setViewingBook({ url: book.pdf_url, title: book.title })}
                          >
                            <BookOpen size={14} /> Read
                          </Button>
                        )}
                        <Button 
                          className="flex-1 rounded-xl h-10" 
                          variant="secondary" 
                          disabled={book.available_copies === 0}
                          onClick={() => handleIssue(book.id)}
                        >
                          Issue
                        </Button>
                      </div>
                    </Card>
                  )}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card title="Current Issues" className="h-fit">
              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Books</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-[10px] font-black uppercase text-brand-600 hover:bg-brand-50"
                    disabled={!issues || issues.length === 0}
                    onClick={async () => {
                      await exportToPDF({
                        title: 'My Library Issues',
                        filename: `library-report-${new Date().getTime()}`,
                        headers: ['Title', 'Author', 'Barcode', 'Due Date', 'Verification'],
                        data: issues.map((i: any) => [
                          i.title,
                          i.author,
                          i.barcode,
                          new Date(i.due_at).toLocaleDateString(),
                          i.qr_code_id // This will be converted to QR image at index 4
                        ]),
                        qrDataIndex: 4
                      });
                    }}
                  >
                    Export PDF
                  </Button>
                </div>

                {!issues || issues.length === 0 ? (
                  <div className="text-center py-10">
                    <History size={40} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-sm text-gray-400 font-medium">No active issues found.</p>
                  </div>
                ) : (
                  issues.map((issue: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-[1.5rem] bg-gray-50/50 border border-transparent hover:border-brand-200 transition-all group">
                      <div className="relative h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
                        {issue.qr_code_id ? (
                          <QRCodeCanvas value={issue.qr_code_id} size={48} level="L" />
                        ) : (
                          <BookOpen size={24} className="text-brand-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-brand-700 transition-colors truncate">{issue.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Due</span>
                          <span className="text-xs font-black text-brand-600">{new Date(issue.due_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="ghost" className="w-full h-12 rounded-2xl text-[11px] font-bold uppercase tracking-widest">
                  View Full History
                </Button>
              </div>
            </Card>

            <Card title="Library Quick Tools">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-24 rounded-2xl flex flex-col gap-2">
                  <Search size={20} />
                  <span className="text-[10px] uppercase font-bold">Catalog</span>
                </Button>
                <Button variant="outline" className="h-24 rounded-2xl flex flex-col gap-2">
                  <History size={20} />
                  <span className="text-[10px] uppercase font-bold">History</span>
                </Button>
                <Button variant="outline" className="h-24 rounded-2xl flex flex-col gap-2 text-red-500 hover:bg-red-50 hover:border-red-100">
                  <AlertCircle size={20} />
                  <span className="text-[10px] uppercase font-bold text-gray-500">Fines</span>
                </Button>
                <Button variant="outline" className="h-24 rounded-2xl flex flex-col gap-2">
                  <ExternalLink size={20} />
                  <span className="text-[10px] uppercase font-bold">Portal</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PDFViewer 
        isOpen={!!viewingBook}
        url={viewingBook?.url || ''}
        title={viewingBook?.title || ''}
        onClose={() => setViewingBook(null)}
      />
    </ShellLayout>
  );
}
