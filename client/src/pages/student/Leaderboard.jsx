import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizApi } from '../../services/quizApi';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';

export default function Leaderboard() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (quizId) {
          const res = await quizApi.getLeaderboard(quizId);
          setLeaderboard(res.data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/quizzes" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Back
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
          <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No results yet. Be the first to take the quiz!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          {leaderboard.slice(0, 3).map((entry, idx) => {
            const isCurrentUser = entry.student?._id === user?._id;
            return (
              <div
                key={idx}
                className={`p-4 flex items-center gap-4 ${
                  idx === 0
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10'
                    : idx === 1
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50'
                    : idx === 2
                    ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10'
                    : 'border-t border-gray-200 dark:border-slate-700'
                } ${isCurrentUser ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(idx + 1)}
                </div>
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {entry.student?.firstName?.charAt(0)}{entry.student?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {entry.student?.firstName} {entry.student?.lastName}
                    {entry.student?._id === user?._id && ' (You)'}
                  </p>
                   <p className="text-sm text-gray-500 dark:text-gray-400">
                     {new Date(entry.completedAt).toLocaleDateString()}
                   </p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${getRankStyle(idx + 1)}`}>{entry.score}%</span>
                </div>
              </div>
            );
          })}

          {leaderboard.slice(3).map((entry, idx) => {
            const isCurrentUser = entry.student?._id === user?._id;
            const actualRank = idx + 4;
            return (
              <div
                key={idx}
                className={`p-3 flex items-center gap-4 border-t border-gray-200 dark:border-slate-700 ${isCurrentUser ? 'bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'} transition-colors`}
              >
                <span className="w-8 text-center text-sm font-bold text-gray-500 dark:text-gray-400">#{actualRank}</span>
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {entry.student?.firstName?.charAt(0)}{entry.student?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {entry.student?.firstName} {entry.student?.lastName}
                    {isCurrentUser && ' (You)'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.score}%</span>
                </div>
              </div>
            );
          })}

          {!leaderboard.find(e => e.student?._id === user?._id) && (
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                You haven't taken this quiz yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
