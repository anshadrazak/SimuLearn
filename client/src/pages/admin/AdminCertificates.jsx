import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { Plus, Edit, Trash2, Award, RefreshCw } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { TableSkeleton } from '../../components/Skeleton';

export default function AdminCertificates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', course: '', recipient: '', certificateId: '', template: '', validUntil: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    adminApi.getCertificates().then(res => { setItems(res.data); setLoading(false); });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = editing ? { ...form, _id: editing._id } : form;
    const fn = editing ? adminApi.updateCertificate(editing._id, payload) : adminApi.createCertificate(payload);
    const res = await fn;
    setItems(editing ? items.map(x => x._id === editing._id ? res.data : x) : [...items, res.data]);
    setForm({ title: '', description: '', course: '', recipient: '', certificateId: '', template: '', validUntil: '' });
    setEditing(null);
  };

  const revoke = async (id) => { await adminApi.revokeCertificate(id); setItems(items.map(x => x._id === id ? { ...x, isRevoked: true } : x)); };
  const remove = async (id) => { if (!confirm('Delete certificate?')) return; await adminApi.deleteCertificate(id); setItems(items.filter(x => x._id !== id)); };

  const filtered = items.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()) || c.certificateId?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="h-8 w-40 skeleton" />
        <div className="card p-6">
          <TableSkeleton rows={6} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Issue and manage certificates</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(null)}>
          <Plus size={18} />
          Issue Certificate
        </button>
      </div>

      {(editing || !items.length) && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certificate Details</h2>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <input className="input" placeholder="Certificate ID" value={form.certificateId} onChange={e => setForm({ ...form, certificateId: e.target.value })} required />
            <input type="date" className="input" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
            <input className="input" placeholder="Recipient (user ID)" value={form.recipient} onChange={e => setForm({ ...form, recipient: e.target.value })} />
            <input className="input" placeholder="Course (course ID)" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
            <button type="submit" className="btn btn-primary">
              {editing ? <>Update</> : <>Issue</>}
            </button>
          </form>
        </div>
      )}

      <div className="card p-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search certificates..." />

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Certificate ID</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Recipient</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filtered.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{c.certificateId}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.recipient?.firstName} {c.recipient?.lastName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.isRevoked
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {c.isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!c.isRevoked && (
                        <button onClick={() => revoke(c._id)} className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-500 dark:text-gray-400 hover:text-amber-600 transition-colors" title="Revoke">
                          <RefreshCw size={16} />
                        </button>
                      )}
                      <button onClick={() => remove(c._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}