import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const labels = {
  admin: 'Dashboard',
  users: 'Users',
  courses: 'Courses',
  categories: 'Categories',
  assignments: 'Assignments',
  scenarios: 'Scenarios',
  certificates: 'Certificates',
  quizzes: 'Quizzes',
  labs: 'Labs',
  analytics: 'Analytics',
  roles: 'Roles',
  permissions: 'Permissions',
  storage: 'Storage',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  const crumbs = parts.map((part, index) => {
    const path = '/' + parts.slice(0, index + 1).join('/');
    const isLast = index === parts.length - 1;
    return {
      label: labels[part] || part.charAt(0).toUpperCase() + part.slice(1),
      path,
      isLast,
    };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <Link to="/admin" className="hover:text-indigo-600 transition-colors">
        <Home size={16} />
      </Link>
      {crumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          <ChevronRight size={14} />
          {crumb.isLast ? (
            <span className="font-medium text-gray-900 dark:text-gray-100">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-indigo-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}