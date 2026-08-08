import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, MoreVertical, UserPlus, Shield, ShieldOff, Trash2 } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { TableSkeleton } from '../../components/Skeleton';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    adminApi.getUsers().then(res => { setUsers(res.data); setLoading(false); });
  }, []);

  const toggleActive = async (u) => {
    const updated = await adminApi.updateUser(u._id, { isActive: !u.isActive });
    setUsers(users.map(x => x._id === u._id ? updated.data : x));
  };

  const remove = async (id) => {
    if (!confirm('Delete user?')) return;
    await adminApi.deleteUser(id);
    setUsers(users.filter(u => u._id !== id));
  };

  const filtered = users.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 skeleton" />
          <div className="h-10 w-40 skeleton" />
        </div>
        <div className="card p-6">
          <TableSkeleton rows={8} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage all users on your platform</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select w-full sm:w-40"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">User</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-info capitalize">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(u)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <ShieldOff size={16} /> : <Shield size={16} />}
                      </button>
                      <button
                        onClick={() => remove(u._id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
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
              No users found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}