import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { TableSkeleton, Skeleton } from '../../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, BookOpen, Users, GraduationCap } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [engagement, setEngagement] = useState(null);
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard(),
      adminApi.getUserGrowth(),
      adminApi.getCourseStats(),
      adminApi.getEngagementStats(),
      adminApi.getTopPerformers(),
    ]).then(([dash, g, c, e, p]) => {
      setOverview(dash.data);
      setGrowth(g.data);
      setCourseStats(c.data);
      setEngagement(e.data);
      setPerformers(p.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="h-8 w-40 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-6"><CardSkeleton /></div>)}
        </div>
      </div>
    );
  }

  const engagementData = engagement ? [
    { name: 'Lab Submissions', value: engagement.labSubmissions },
    { name: 'Quiz Attempts', value: engagement.quizAttempts },
    { name: 'Scenario Submissions', value: engagement.scenarioSubmissions },
  ] : [];

  return (
    <div className="space-y-6 fade-in">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: overview?.users || 0, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Courses', value: overview?.courses || 0, icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
          { label: 'Enrollments', value: overview?.enrollments || 0, icon: GraduationCap, gradient: 'from-violet-500 to-purple-500' },
          { label: 'Labs', value: overview?.labs || 0, icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
        ].map(s => (
          <div key={s.label} className="card p-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.gradient} opacity-10 rounded-full -mr-8 -mt-8`} />
            <div className="relative z-10">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Enrollment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseStats.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="title" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip />
              <Bar dataKey="enrollmentCount" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Engagement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={engagementData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performers</h2>
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {performers.map(p => (
              <div key={p.studentId} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{p.avgGrade}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.quizCount} quizzes</p>
                </div>
              </div>
            ))}
            {performers.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}