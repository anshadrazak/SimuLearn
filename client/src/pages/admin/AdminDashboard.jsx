import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getDashboard(), adminApi.getAnalyticsOverview()]).then(([dashRes, statsRes]) => {
      setData({ ...dashRes.data, ...statsRes.data });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  const cards = [
    { to: '/admin/users', label: 'Users', value: data?.users || 0, color: 'bg-blue-50 text-blue-700' },
    { to: '/admin/courses', label: 'Courses', value: data?.courses || 0, color: 'bg-emerald-50 text-emerald-700' },
    { to: '/admin/enrollments', label: 'Enrollments', value: data?.enrollments || 0, color: 'bg-violet-50 text-violet-700' },
    { to: '/admin/labs', label: 'Labs', value: data?.labs || 0, color: 'bg-amber-50 text-amber-700' },
    { to: '/admin/quizzes', label: 'Quizzes', value: data?.quizzes || 0, color: 'bg-rose-50 text-rose-700' },
    { to: '/admin/scenarios', label: 'Scenarios', value: data?.scenarios || 0, color: 'bg-teal-50 text-teal-700' },
    { to: '/admin/assignments', label: 'Assignments', value: data?.assignments || 0, color: 'bg-orange-50 text-orange-700' },
    { to: '/admin/certificates', label: 'Certificates', value: data?.certificates || 0, color: 'bg-cyan-50 text-cyan-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.to} to={c.to} className={`rounded-lg border p-4 hover:shadow-md transition ${c.color}`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-2">System Health</h2>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>API and Database operational</span>
        </div>
      </div>
    </div>
  );
}