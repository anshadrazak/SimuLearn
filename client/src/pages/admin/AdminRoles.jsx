import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { TableSkeleton } from '../../components/Skeleton';

export default function AdminRoles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', permissions: [], isSystem: false });
  const [allPerms, setAllPerms] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    Promise.all([adminApi.getRoles(), adminApi.getPermissions()]).then(([r, p]) => {
      setItems(r.data);
      setAllPerms(p.data);
      setLoading(false);
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = editing ? { ...form, _id: editing._id } : form;
    const fn = editing ? adminApi.updateRole(editing._id, payload) : adminApi.createRole(payload);
    const res = await fn;
    setItems(editing ? items.map(x => x._id === editing._id ? res.data : x) : [...items, res.data]);
    setForm({ name: '', description: '', permissions: [], isSystem: false });
    setEditing(null);
  };

  const togglePerm = (p) => setForm({
    ...form,
    permissions: form.permissions.includes(p) ? form.permissions.filter(x => x !== p) : [...form.permissions, p]
  });

  const remove = async (id) => { if (!confirm('Delete role?')) return; await adminApi.deleteRole(id); setItems(items.filter(x => x._id !== id)); };

  const filtered = items.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="h-8 w-40 skeleton" />
        <div className="card p-6">
          <TableSkeleton rows={6} cols={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Define roles and their permissions</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={save} className="flex flex-wrap items-end gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Role Name</label>
            <input className="input" placeholder="e.g., Editor" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
            <input className="input" placeholder="What this role can do" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn btn-primary">
            {editing ? <><Edit size={18} /> Update</> : <><Plus size={18} /> Create</>}
          </button>
        </form>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Available Permissions</p>
          <div className="flex flex-wrap gap-2">
            {allPerms.map(p => (
              <button
                key={p._id}
                type="button"
                onClick={() => togglePerm(p.name)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  form.permissions.includes(p.name)
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
                    : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search roles..." />

        <div className="mt-4 space-y-2">
          {filtered.map(r => (
            <div key={r._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{r.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-1 mr-2">
                  {r.permissions?.slice(0, 3).map(p => (
                    <span key={p} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">{p}</span>
                  ))}
                  {r.permissions?.length > 3 && (
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                      +{r.permissions.length - 3}
                    </span>
                  )}
                </div>
                <button onClick={() => { setEditing(r); setForm({ name: r.name, description: r.description || '', permissions: r.permissions || [], isSystem: r.isSystem }); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Edit size={16} />
                </button>
                {!r.isSystem && (
                  <button onClick={() => remove(r._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No roles found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}