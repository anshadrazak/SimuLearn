import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CardSkeleton } from '../../components/Skeleton';
import { BookOpen, Clock, FileText, TrendingUp, Award } from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Dashboard load error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
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

  const stats = [
    { label: 'My Courses', value: data?.myCourses?.length || 0, icon: BookOpen, gradient: 'from-blue-500 to-cyan-500', to: '/courses' },
    { label: 'In Progress', value: data?.continueLearning?.length || 0, icon: Clock, gradient: 'from-emerald-500 to-teal-500', to: '/courses' },
    { label: 'Assignments', value: data?.upcomingAssignments?.length || 0, icon: FileText, gradient: 'from-violet-500 to-purple-500', to: '/courses' },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your learning journey</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, gradient, to }) => (
          <Link
            key={label}
            to={to}
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`} />
            <div className="relative z-10">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${gradient} text-white mb-3`}>
                <Icon size={24} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Continue Learning</h3>
          <div className="space-y-3">
            {data?.continueLearning?.length ? data.continueLearning.map(item => (
              <Link key={item._id} to={`/courses/${item.course?._id}`} className="block p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{item.course?.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </Link>
            )) : <p className="text-gray-500 dark:text-gray-400">No courses in progress.</p>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Assignments</h3>
          <div className="space-y-3">
            {data?.upcomingAssignments?.length ? data.upcomingAssignments.map(a => (
              <div key={a._id} className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{a.course?.title}</p>
                <p className="text-sm text-red-500 mt-1">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
              </div>
            )) : <p className="text-gray-500 dark:text-gray-400">No upcoming assignments.</p>}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Overview</h3>
        {data?.progressData?.length ? (
          <div className="h-80">
            <BarChart data={data.progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip />
              <Bar dataKey="progress" fill="url(#progressGradient)" radius={[4, 4, 0, 0]}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </div>
        ) : <p className="text-gray-500 dark:text-gray-400">No progress data available yet.</p>}
      </div>
    </div>
  );
}