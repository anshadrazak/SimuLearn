import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { CardSkeleton } from '../../components/Skeleton';
import { TrendingUp, Users, BookOpen, GraduationCap, FlaskConical, HelpCircle, ScrollText, Award } from 'lucide-react';

const statCards = [
  { to: '/admin/users', label: 'Users', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
  { to: '/admin/enrollments', label: 'Enrollments', icon: GraduationCap, gradient: 'from-violet-500 to-purple-500' },
  { to: '/admin/labs', label: 'Labs', icon: FlaskConical, gradient: 'from-amber-500 to-orange-500' },
  { to: '/admin/quizzes', label: 'Quizzes', icon: HelpCircle, gradient: 'from-rose-500 to-pink-500' },
  { to: '/admin/scenarios', label: 'Scenarios', icon: ScrollText, gradient: 'from-indigo-500 to-blue-500' },
  { to: '/admin/assignments', label: 'Assignments', icon: TrendingUp, gradient: 'from-orange-500 to-red-500' },
  { to: '/admin/certificates', label: 'Certificates', icon: Award, gradient: 'from-yellow-500 to-amber-500' },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, statsRes] = await Promise.all([adminApi.getDashboard(), adminApi.getAnalyticsOverview()]);
      setData({ ...dashRes.data, ...statsRes.data });
      setLoading(false);
    } catch (err) {
      console.error('Dashboard load error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button onClick={loadDashboard} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ to, label, value, icon: Icon, gradient }) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`} />
            <div className="relative z-10">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${gradient} text-white mb-3`}>
                <Icon size={24} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data?.[label.toLowerCase()] || 0}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System Health</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">All systems operational</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">API and Database operational</span>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/courses/new" className="btn btn-primary">Create Course</Link>
            <Link to="/admin/users" className="btn btn-secondary">Manage Users</Link>
            <Link to="/admin/analytics" className="btn btn-secondary">View Analytics</Link>
          </div>
        </div>
      </div>
    </div>
  );
}