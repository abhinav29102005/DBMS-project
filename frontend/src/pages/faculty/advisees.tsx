import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { ColumnDef } from '@tanstack/react-table';
import { Users, Search, Mail, ExternalLink, GraduationCap, TrendingUp, Send, Loader2 } from 'lucide-react';
import Head from 'next/head';
import { useState, useMemo } from 'react';
import { useFacultyAdvisees } from '@/hooks/useFaculty';
import { Loading } from '@/components/feedback/Loading';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Input } from '@/components/ui/Input';
import { Drawer } from '@/components/ui/Drawer';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export default function FacultyAdviseesPage() {
  const { data: advisees, isLoading, isError, refetch } = useFacultyAdvisees();
  const [search, setSearch] = useState('');
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [selectedAdvisee, setSelectedAdvisee] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('Academic Mentorship Update');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!emailMessage.trim()) return;
    setIsSending(true);
    try {
      await apiFetch('/api/v1/academic/faculty/me/advisees/email', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedAdvisee.id,
          subject: emailSubject,
          message: emailMessage
        })
      });
      toast.success('Email sent successfully via Brevo pipeline!');
      setIsEmailDrawerOpen(false);
      setEmailMessage('');
    } catch (error) {
      toast.error('Failed to send email. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredAdvisees = useMemo(() => {
    if (!advisees) return [];
    return advisees.filter((s: any) => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.student_no.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [advisees, search]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'student_no', header: 'Student ID' },
    { 
      accessorKey: 'name', 
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{row.original.name}</span>
          <span className="text-[10px] text-gray-400 font-medium lowercase">{row.original.email}</span>
        </div>
      )
    },
    { accessorKey: 'program_name', header: 'Program' },
    { 
      accessorKey: 'current_semester', 
      header: 'Semester',
      cell: ({ row }) => `Semester ${row.original.current_semester}`
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-brand-600 hover:bg-brand-50"
            onClick={() => {
              setSelectedAdvisee(row.original);
              setIsEmailDrawerOpen(true);
            }}
          >
            <Mail size={14} className="mr-2" />
            Send Advice
          </Button>
          <Button variant="outline" size="sm">History</Button>
        </div>
      )
    }
  ];

  const mobileCard = (student: any) => (
    <Card className="p-4" onClick={() => {
      setSelectedAdvisee(student);
      setIsEmailDrawerOpen(true);
    }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Users size={18} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{student.name}</h4>
            <p className="text-xs text-gray-400">{student.student_no}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-brand-600">
          <Mail size={14} />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Program</span>
          <p className="text-xs font-bold text-gray-700 truncate">{student.program_name}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Semester</span>
          <p className="text-xs font-bold text-gray-700">{student.current_semester}</p>
        </div>
      </div>
    </Card>
  );

  if (isError) return <ShellLayout role="faculty"><ErrorState onRetry={refetch} /></ShellLayout>;

  return (
    <ShellLayout role="faculty">
      <Head>
        <title>My Advisees | Faculty Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mentorship & Advisees</h1>
            <p className="text-sm text-gray-500">Track and guide your assigned students' academic progress.</p>
          </div>
          <Button variant="primary">
            <GraduationCap size={16} /> Schedule Group Meeting
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Advisees" icon={Users} subtitle="Students assigned to you">
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{advisees?.length || 0}</span>
            </div>
          </Card>
          <Card title="Academic Alert" icon={TrendingUp} subtitle="Critical GPA status">
            <div className="mt-2">
              <span className="text-3xl font-bold text-red-500">0</span>
            </div>
          </Card>
          <Card title="Graduating Soon" icon={ExternalLink} subtitle="Final year students">
            <div className="mt-2">
              <span className="text-3xl font-bold text-brand-600">0</span>
            </div>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search advisees by name, ID or program..." 
            className="pl-12 h-12 rounded-2xl" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <DataTable
            data={filteredAdvisees}
            columns={columns}
            mobileCard={mobileCard}
          />
        )}

        <Drawer 
          open={isEmailDrawerOpen} 
          onClose={() => setIsEmailDrawerOpen(false)}
          title={`Email Advice to ${selectedAdvisee?.name}`}
        >
          <div className="space-y-6">
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-brand-600 shadow-sm">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedAdvisee?.email}</p>
                <p className="text-xs text-brand-600 font-medium">Direct mentorship via Brevo API</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
              <Input 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Message Content</label>
              <textarea 
                className="w-full h-48 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm"
                placeholder="Provide your academic guidance or instructions here..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold shadow-lg shadow-brand-500/20"
              onClick={handleSendEmail}
              disabled={isSending || !emailMessage.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Sending Advice...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={20} />
                  Dispatch official Mail
                </>
              )}
            </Button>
          </div>
        </Drawer>
      </div>
    </ShellLayout>
  );
}
