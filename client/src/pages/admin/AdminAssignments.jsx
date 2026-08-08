import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { TableSkeleton } from '../../components/Skeleton';

export default function AdminAssignments() {
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', course: '', module: '', dueDate: '', maxScore: 100, isPublished: false });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    Promise.all([adminApi.getAllAssignments(), adminApi.getCourses()]).then(([aRes, cRes]) => {
      setItems(aRes.data || aRes);
      setCourses(cRes.data);
      setLoading(false);
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = editing ? { ...form, _id: editing._id } : form;
    const fn = editing ? adminApi.updateAssignment(editing._id, payload) : adminApi.createAssignment(payload);
    const res = await fn;
    setItems(editing ? items.map(x => x._id === editing._id ? res.data : x) : [...items, res.data]);
    setForm({ title: '', description: '', course: '', module: '', dueDate: '', maxScore: 100, isPublished: false });
    setEditing(null);
  };

  const startEdit = (a) => { setEditing(a); setForm({ title: a.title, description: a.description || '', course: a.course?._id || a.course || '', module: a.module || '', dueDate: a.dueDate ? a.dueDate.slice(0,10) : '', maxScore: a.maxScore || 100, isPublished: a.isPublished }); };
  const remove = async (id) => { if (!confirm('Delete assignment?')) return; await adminApi.deleteAssignment ? adminApi.deleteAssignment(id) : Promise.reject(); setItems(items.filter(x => x._id !== id)); };

  const filtered = items.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage course assignments</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <input className="input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <select className="select" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
            <option value="">Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <input className="input" placeholder="Module" value={form.module} onChange={e => setForm({ ...form, module: e.target.value })} />
          <input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <input type="number" className="input" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: Number(e.target.value) })} />
          <button className="btn btn-primary">
            {editing ? <><Edit size={18} /> Update</> : <><Plus size={18} /> Create</>}
          </button>
        </form>

        <SearchBar value={search} onChange={setSearch} placeholder="Search assignments..." />

        <div className="mt-4 space-y-2">
          {filtered.map(a => (
            <div key={a._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {a.course?.title || a.courseName || 'No course'} • Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No date'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(a)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => remove(a._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No assignments found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}