import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from './services/api';
import { Link } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminPanel from './pages/admin/AdminPanel';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminLabs from './pages/admin/AdminLabs';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminScenarios from './pages/admin/AdminScenarios';
import AdminAssignments from './pages/admin/AdminAssignments';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminRoles from './pages/admin/AdminRoles';
import AdminPermissions from './pages/admin/AdminPermissions';
import AdminStorage from './pages/admin/AdminStorage';
import AdminCourseBuilder from './pages/admin/AdminCourseBuilder';
import AdminLabBuilder from './pages/admin/AdminLabBuilder';
import AdminQuizBuilder from './pages/admin/AdminQuizBuilder';
import AdminScenarioBuilder from './pages/admin/AdminScenarioBuilder';
import StudentCourseDetail from './pages/student/CourseDetail';
import StudentLabs from './pages/student/StudentLabs';
import StudentLabDetail from './pages/student/StudentLabDetail';

import StudentQuizzes from './pages/student/StudentQuizzes';
import QuizTake from './pages/student/QuizTake';
import StudentScenarios from './pages/student/StudentScenarios';
import StudentScenarioDetail from './pages/student/StudentScenarioDetail';
import Leaderboard from './pages/student/Leaderboard';
import AccountSettings from './pages/student/AccountSettings';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function DashboardHome() {
  const { user } = useAuth();
  if (user.role === 'student') return <StudentDashboard />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Navigate to="/login" />;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-primary)]">
      <aside className="w-64 bg-[var(--color-sidebar)] text-white flex flex-col overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <Link to="/" className="block">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 cursor-pointer hover:from-indigo-300 hover:to-purple-300 transition-all">SimuLearn</h2>
            </Link>
            <p className="text-xs text-slate-300/70 mt-1">{user?.firstName} {user?.lastName}</p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link to="/" className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/' ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:bg-white/5 hover:text-white'}`}>Dashboard</Link>
          {isStudent && (
            <>
              <Link to="/courses" className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname.startsWith('/courses') ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:bg-white/5 hover:text-white'}`}>My Courses</Link>
              <Link to="/labs" className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/labs' ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:bg-white/5 hover:text-white'}`}>Labs</Link>
              <Link to="/quizzes" className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/quizzes' ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:bg-white/5 hover:text-white'}`}>Quizzes</Link>
              <Link to="/scenarios" className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/scenarios' ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:bg-white/5 hover:text-white'}`}>Scenarios</Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/admin' || location.pathname.startsWith('/admin') ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:bg-white/5 hover:text-white'}`}>Admin Panel</Link>
          )}
          <Link to="/settings" className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/settings' ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:bg-white/5 hover:text-white'}`}>Account Settings</Link>
          <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-300/80 hover:text-white hover:bg-red-800/10 rounded-lg transition-all">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={<PrivateRoute roles={['student', 'admin']}><Dashboard /></PrivateRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="courses" element={<CoursesList />} />
        <Route path="courses/:courseId" element={<StudentCourseDetail />} />
        <Route path="labs" element={<StudentLabs />} />
        <Route path="labs/:labId" element={<StudentLabDetail />} />
        <Route path="quizzes" element={<StudentQuizzes />} />
        <Route path="quizzes/:quizId" element={<QuizTake />} />
        <Route path="quizzes/:quizId/leaderboard" element={<Leaderboard />} />
        <Route path="scenarios" element={<StudentScenarios />} />
        <Route path="scenarios/:scenarioId" element={<StudentScenarioDetail />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminPanel /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:courseId" element={<AdminCourseBuilder />} />
        <Route path="labs" element={<AdminLabs />} />
        <Route path="labs/:labId" element={<AdminLabBuilder />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="quizzes/:quizId" element={<AdminQuizBuilder />} />
        <Route path="scenarios" element={<AdminScenarios />} />
        <Route path="scenarios/:scenarioId" element={<AdminScenarioBuilder />} />
        <Route path="assignments" element={<AdminAssignments />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="permissions" element={<AdminPermissions />} />
        <Route path="storage" element={<AdminStorage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Courses</h1>
      {courses.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No courses enrolled yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map(course => (
            <Link key={course._id} to={`/courses/${course._id}`} className="card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg mb-4 opacity-80" />
              <h2 className="font-semibold text-gray-900 dark:text-white">{course.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.shortDescription}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}