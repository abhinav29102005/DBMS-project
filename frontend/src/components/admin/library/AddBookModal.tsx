'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { libraryService } from '@/services/library/libraryService';
import { toast } from 'sonner';
import { X, Book, Hash, User, Building, Layers } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

export function AddBookModal({ isOpen, onClose, onRefresh }: { isOpen: boolean; onClose: () => void; onRefresh: () => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    subject_id: '',
    copies: 1
  });

  useEffect(() => {
    if (isOpen) {
      libraryService.getSubjects().then(setSubjects).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // For now, using DataEditor endpoint logic or a dedicated add book endpoint
      // Let's check if we have a generic create endpoint
      await libraryService.addBook(formData);
      toast.success('Book added successfully');
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add book');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Book</h2>
            <p className="text-xs text-gray-500 font-medium">Add a new title to the library catalog.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">ISBN</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
                <Input
                  required
                  placeholder="978-..."
                  className="pl-12 h-14 rounded-2xl"
                  value={formData.isbn}
                  onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
                <select
                  required
                  className="w-full pl-12 h-14 rounded-2xl border border-gray-100 bg-white text-sm font-medium focus:ring-2 focus:ring-brand-500/20 outline-none transition-all appearance-none"
                  value={formData.subject_id}
                  onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Book Title</label>
              <div className="relative">
                <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
                <Input
                  required
                  placeholder="Full Title of the Book"
                  className="pl-12 h-14 rounded-2xl"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Author</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
                <Input
                  required
                  placeholder="Author Name"
                  className="pl-12 h-14 rounded-2xl"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Publisher</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
                <Input
                  placeholder="Publisher Name"
                  className="pl-12 h-14 rounded-2xl"
                  value={formData.publisher}
                  onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Digital PDF URL</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
                <Input
                  placeholder="https://..."
                  className="pl-12 h-14 rounded-2xl"
                  value={(formData as any).pdf_url}
                  onChange={e => setFormData({ ...formData, pdf_url: e.target.value } as any)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Initial Copies</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
                <Input
                  type="number"
                  min="1"
                  className="pl-12 h-14 rounded-2xl"
                  value={formData.copies}
                  onChange={e => setFormData({ ...formData, copies: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl">Cancel</Button>
            <Button type="submit" variant="primary" loading={isLoading} className="flex-[2] h-14 rounded-2xl shadow-xl shadow-brand-500/20">
              Create Book Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
