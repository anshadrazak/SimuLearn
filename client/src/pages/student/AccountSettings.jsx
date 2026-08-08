import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

export default function AccountSettings() {
  const { user, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== user?.email) {
      alert('Please type your email address correctly to confirm.');
      return;
    }

    if (!window.confirm('This will permanently delete your account and ALL associated data. This cannot be undone. Are you sure?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteAccount();
      alert('Your account has been permanently deleted along with all your data.');
      window.location.href = '/login';
    } catch (err) {
      alert('Failed to delete account: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your account, there is no going back. This will permanently delete:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
          <li>Your email, password, and all personal information</li>
          <li>All submission history (assignments, labs, scenarios)</li>
          <li>All quiz attempts and results</li>
          <li>All learning progress data</li>
          <li>All uploaded files and assets</li>
          <li>Your course enrollments</li>
          <li>Any certificates issued to you</li>
          <li>Any courses you created</li>
        </ul>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type your email to confirm: {user?.email}
          </label>
          <input
            type="email"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            placeholder={user?.email || ''}
          />
        </div>

        <button
          onClick={handleDeleteAccount}
          disabled={loading || confirmText !== user?.email}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium disabled:bg-red-400"
        >
          {loading ? 'Deleting Account...' : 'Permanently Delete My Account'}
        </button>
      </div>
    </div>
  );
}
