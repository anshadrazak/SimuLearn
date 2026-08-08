import { Menu } from 'lucide-react';

export default function MobileHeader({ onMenuClick, title }) {
  return (
    <div className="lg:hidden flex items-center justify-between p-4 bg-[var(--color-sidebar)] text-white sticky top-0 z-30 safe-top">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors touch-manipulation"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">SimuLearn</h1>
        </div>
      </div>
      {title && <h2 className="text-sm font-medium text-slate-300 truncate max-w-[200px]">{title}</h2>}
    </div>
  );
}
