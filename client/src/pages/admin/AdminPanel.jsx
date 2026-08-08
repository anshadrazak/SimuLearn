import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const nav = [
  { to: '/admin', end: true, label: 'Dashboard', icon: '📊' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { to: '/admin/assignments', label: 'Assignments', icon: '📝' },
  { to: '/admin/scenarios', label: 'Scenarios', icon: '🎭' },
  { to: '/admin/certificates', label: 'Certificates', icon: '🏆' },
  { to: '/admin/quizzes', label: 'Quizzes', icon: '❓' },
  { to: '/admin/labs', label: 'Labs', icon: '🔬' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/roles', label: 'Roles', icon: '🔐' },
  { to: '/admin/permissions', label: 'Permissions', icon: '🛡️' },
  { to: '/admin/storage', label: 'Storage', icon: '💾' },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-primary)]">
      <aside className="w-64 bg-[var(--color-sidebar)] text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SimuLearn
              </h1>
              <p className="text-xs text-slate-400 mt-1">{user?.firstName} {user?.lastName}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 slide-in ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2.5 text-sm text-red-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}