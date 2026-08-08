import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { Trash2, HardDrive } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { TableSkeleton } from '../../components/Skeleton';

export default function AdminStorage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.getAssets().then(res => { setAssets(res.data); setLoading(false); });
  }, []);

  const remove = async (id) => {
    if (!confirm('Delete this file?')) return;
    await adminApi.deleteAsset(id);
    setAssets(assets.filter(a => a._id !== id));
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const totalSize = assets.reduce((sum, a) => sum + (a.size || 0), 0);

  const filtered = assets.filter(a =>
    a.originalName?.toLowerCase().includes(search.toLowerCase()) ||
    a.mimetype?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Storage</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage uploaded files and assets</p>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2">
          <HardDrive size={20} className="text-indigo-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Total: <strong>{formatSize(totalSize)}</strong></span>
        </div>
      </div>

      <div className="card p-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search files..." />

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">File</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Size</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Uploaded</th>
                <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filtered.map(a => (
                <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.originalName || a.filename}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">{a.mimetype?.split('/').pop()}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatSize(a.size)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(a._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No files found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}