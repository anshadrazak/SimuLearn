import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { TableSkeleton } from '../../components/Skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    adminApi.getCategories().then(res => { setItems(res.data); setLoading(false); });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = editing ? { ...form, _id: editing._id } : form;
    const fn = editing ? adminApi.updateCategory(editing._id, payload) : adminApi.createCategory(payload);
    const res = await fn;
    setItems(editing ? items.map(x => x._id === editing._id ? res.data : x) : [...items, res.data]);
    setForm({ name: '', description: '', sortOrder: 0 });
    setEditing(null);
  };

  const startEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', sortOrder: c.sortOrder || 0 }); };
  const remove = async (id) => { if (!confirm('Delete category?')) return; await adminApi.deleteCategory(id); setItems(items.filter(x => x._id !== id)); };

  const filtered = items.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Organize your courses with categories</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
          <input
            className="input"
            placeholder="Category name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            className="input"
            placeholder="Sort order"
            value={form.sortOrder}
            onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
          <button className="btn btn-primary">
            {editing ? <><Edit size={18} /> Update</> : <><Plus size={18} /> Create</>}
          </button>
        </form>

        <SearchBar value={search} onChange={setSearch} placeholder="Search categories..." />

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Description</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Sort</th>
                <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filtered.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.description}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => remove(c._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}