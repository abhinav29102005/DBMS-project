import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/feedback/Loading';
import { Edit2, Save, X, Trash2, Plus, Database } from 'lucide-react';
import { toast } from 'sonner';

interface DataEditorProps {
  schema: string;
  table: string;
  title: string;
}

export function DataEditor({ schema, table, title }: DataEditorProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);

  const fetchUrl = `/api/v1/core/admin/data/${schema}/${table}`;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + fetchUrl, {
        headers: {
          'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
      if (json.length > 0) {
        setColumns(Object.keys(json[0]));
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schema, table]);

  const handleEditClick = (row: any) => {
    setEditingId(row.id);
    setEditFormData(row);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `${fetchUrl}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Record updated successfully');
      setEditingId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `${fetchUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Record deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error('Failed to add record');
      toast.success('Record added successfully');
      setIsAdding(false);
      setEditFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <Card className="p-8"><Loading /></Card>;

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs font-medium text-gray-500 font-mono">{schema}.{table}</p>
          </div>
        </div>
        <Button onClick={() => { setIsAdding(true); setEditFormData({}); }} size="sm">
          <Plus size={16} className="mr-2" /> Add Record
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {isAdding && (
          <div className="p-6 bg-brand-50 border-b border-brand-100">
            <h3 className="font-bold text-brand-900 mb-4">New Record</h3>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {columns.filter(c => c !== 'id' && c !== 'created_at' && c !== 'updated_at').map(col => (
                <div key={col}>
                  <label className="block text-xs font-bold text-brand-700 mb-1">{col}</label>
                  <Input 
                    value={editFormData[col] || ''} 
                    onChange={e => setEditFormData({ ...editFormData, [col]: e.target.value })}
                  />
                </div>
              ))}
              <div className="col-span-full flex gap-3 mt-2">
                <Button type="submit">Save Record</Button>
                <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-6 py-4 font-bold">{col}</th>
              ))}
              <th className="px-6 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap">
                    {editingId === row.id && col !== 'id' && col !== 'created_at' && col !== 'updated_at' ? (
                      <input
                        className="w-full border-b-2 border-brand-500 outline-none bg-transparent py-1 font-mono text-xs"
                        value={editFormData[col] || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, [col]: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-600 font-mono text-xs truncate max-w-[150px] inline-block" title={row[col]}>
                        {row[col]?.toString() || '—'}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === row.id ? (
                      <>
                        <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Save size={16} /></button>
                        <button onClick={handleCancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && !isAdding && (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-gray-500 font-medium">
                  No records found in {schema}.{table}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
