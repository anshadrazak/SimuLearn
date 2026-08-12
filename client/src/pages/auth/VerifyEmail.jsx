import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import AuthLayout from '../../components/AuthLayout';

export default function VerifyEmail() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }
      try {
        const res = await api.post('/auth/verify-email', { token });
        setMessage(res.data.message);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <AuthLayout
      title={message ? 'Email verified!' : error ? 'Verification failed' : 'Verify your email'}
      subtitle={
        message ? 'Your email has been successfully verified.' :
        error ? 'We could not verify your email address.' :
        'Please verify your email to continue.'
      }
    >
      <div className="text-center space-y-6">
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
          </div>
        )}
        {message && !loading && (
          <div className="fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Redirecting to login...</p>
            <div className="flex justify-center">
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Go to Login
              </button>
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Didn't get a link? Register again to receive a new verification email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/register')} className="btn btn-primary">
                Back to Register
              </button>
              <Link to="/login" className="btn btn-secondary">
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}