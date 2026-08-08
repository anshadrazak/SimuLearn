import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { TableSkeleton } from '../../components/Skeleton';

export default function AdminScenarios() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'medium', maxAttempts: 3, isPublished: false });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    adminApi.getScenarios().then(res => { setItems(res.data); setLoading(false); });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = editing ? { ...form, _id: editing._id } : form;
    const res = await (editing ? adminApi.updateScenario(editing._id, payload) : adminApi.createScenario(payload));
    setItems(editing ? items.map(x => x._id === editing._id ? res.data : x) : [...items, res.data]);
    setForm({ title: '', description: '', difficulty: 'medium', maxAttempts: 3, isPublished: false });
    setEditing(null);
  };

  const remove = async (id) => { if (!confirm('Delete scenario?')) return; await adminApi.deleteScenario(id); setItems(items.filter(x => x._id !== id)); };

  const filtered = items.filter(s => s.title?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="h-8 w-40 skeleton" />
        <div className="card p-6">
          <TableSkeleton rows={6} cols={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scenarios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage immersive learning scenarios</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
          <input className="input sm:col-span-2" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <select className="select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input type="number" className="input" value={form.maxAttempts} onChange={e => setForm({ ...form, maxAttempts: Number(e.target.value) })} />
          <button className="btn btn-primary">
            {editing ? <><Edit size={18} /> Update</> : <><Plus size={18} /> Create</>}
          </button>
        </form>

        <SearchBar value={search} onChange={setSearch} placeholder="Search scenarios..." />

        <div className="mt-4 space-y-2">
          {filtered.map(s => (
            <div key={s._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditing(s); setForm({ title: s.title, description: s.description || '', difficulty: s.difficulty || 'medium', maxAttempts: s.maxAttempts || 3, isPublished: s.isPublished }); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => remove(s._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No scenarios found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}