import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';

export default function MobileSidebar({ isOpen, onClose, navItems, user, onLogout, sidebarContent }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[var(--color-sidebar)] text-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">SimuLearn</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors touch-manipulation">
                <X size={20} />
              </button>
            </div>
            {user && (
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm text-slate-300 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            )}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 touch-manipulation ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            {sidebarContent && <div className="p-3 border-t border-white/10">{sidebarContent}</div>}
            <div className="p-3 border-t border-white/10">
              <button
                onClick={() => { onClose(); onLogout(); }}
                className="w-full text-left px-3 py-3 text-sm text-red-300 hover:text-white hover:bg-red-800/10 rounded-lg transition-all duration-200 touch-manipulation"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
