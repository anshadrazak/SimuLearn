import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { quizApi } from '../../services/quizApi';
import { Trophy, Medal, Award, RefreshCw } from 'lucide-react';

export default function QuizTake() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    quizApi.startQuiz(quizId).then(startRes => {
      setAttempt(startRes.data.attempt);
      setQuiz(startRes.data.quiz);
      setQuestions(startRes.data.questions || []);
      const totalSeconds = (startRes.data.quiz.duration || 30) * 60;
      setTimeLeft(totalSeconds);
      setLoading(false);
    }).catch(err => {
      if (err.response?.status === 400 && err.response?.data?.message === 'Test already completed') {
        setAlreadyCompleted(true);
        setResult(err.response.data.attempt || null);
        quizApi.getQuiz(quizId).then(qRes => {
          setQuiz(qRes.data);
        }).catch(() => {});
      }
      setLoading(false);
    });
  }, [quizId]);

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleMultiSelect = (questionId, option, checked) => {
    const current = answers[questionId] || [];
    const next = checked ? [...current, option] : current.filter(item => item !== option);
    handleAnswer(questionId, next);
  };

  const handleMatching = (questionId, left, right) => {
    const current = answers[questionId] || {};
    handleAnswer(questionId, { ...current, [left]: right });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await quizApi.submitQuiz(quizId, {
        answers,
        questions: questions.map(q => q._id),
        timeSpent: (quiz?.duration || 30) * 60 - (timeLeft || 0)
      });
      setResult(res.data);
      try {
        const lbRes = await quizApi.getLeaderboard(quizId);
        setLeaderboard(lbRes.data || []);
      } catch (e) {
        console.error('Failed to fetch leaderboard', e);
      }
    } catch (err) {
      console.error('Submit failed:', err);
      if (err.response?.data?.message) {
        alert('Error submitting quiz: ' + err.response.data.message);
      } else {
        alert('Error submitting quiz. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (loading || timeLeft === null || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>;

  if (alreadyCompleted && result) {
    const score = result.finalGrade || result.score || 0;
    const totalPoints = result.totalPoints || 30;
    const earnedPoints = Math.round((score / 100) * totalPoints);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center transition-all duration-300">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Test Already Completed</h1>
          <div className="mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Your Score</p>
            <div className="flex items-center justify-center gap-3">
              <p
                className={`text-5xl font-bold ${score >= (quiz?.passingScore || 50) ? 'text-green-500' : 'text-red-500'}`}
              >
                {score}% ({earnedPoints}/{totalPoints} marks)
              </p>
              <button
                onClick={() => {
                  quizApi.getLeaderboard(quizId).then(res => setLeaderboard(res.data || []));
                }}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                title="Refresh leaderboard"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
          <p className={`text-xl mb-6 ${score >= (quiz?.passingScore || 50) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {score >= (quiz?.passingScore || 50) ? 'Passed!' : 'Not passed'}
          </p>

          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={() => navigate('/quizzes')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            >
              Back to Quizzes
            </button>
            <Link
              to={`/quizzes/${quizId}/leaderboard`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            >
              View Leaderboard
            </Link>
          </div>

          {leaderboard.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 3 Rankings
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 3).map((entry, idx) => {
                  const isCurrentUser = entry.student?._id === user?._id;
                  const rankColors = idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : 'text-orange-400';
                  const rankBg = idx === 0
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10'
                    : idx === 1
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50'
                    : 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10';
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        isCurrentUser
                          ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-lg'
                          : rankBg
                      }`}
                    >
                      <div className="flex items-center justify-center w-7">
                        {idx === 0 && <Trophy className="w-5 h-5 text-yellow-400" />}
                        {idx === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {idx === 2 && <Award className="w-5 h-5 text-orange-400" />}
                        {idx >= 3 && <span className={`font-bold text-sm ${rankColors}`}>#{idx + 1}</span>}
                      </div>
                      <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                          {entry.student?.firstName?.charAt(0)}{entry.student?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.student?.firstName} {entry.student?.lastName}
                          {entry.student?._id === user?._id && ' (You)'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (result) {
    const score = result.finalGrade || result.score || 0;
    const totalPoints = result.totalPoints || 30;
    const earnedPoints = Math.round((score / 100) * totalPoints);
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center transition-all duration-300">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quiz Completed</h1>
          <div className="mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Your Score</p>
            <div className="flex items-center justify-center gap-3">
              <p
                className={`text-5xl font-bold mb-2 ${score >= (quiz?.passingScore || 50) ? 'text-green-500' : 'text-red-500'}`}
              >
                {score}% ({earnedPoints}/{totalPoints} marks)
              </p>
              <button
                onClick={() => {
                  quizApi.getLeaderboard(quizId).then(res => setLeaderboard(res.data || []));
                }}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                title="Refresh leaderboard"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
          <p className={`text-xl mb-6 ${score >= (quiz?.passingScore || 50) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {score >= (quiz?.passingScore || 50) ? 'Passed!' : 'Not passed'}
          </p>

          {!showAnswers ? (
            <button
              onClick={() => setShowAnswers(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 mb-4"
            >
              Check Answers
            </button>
          ) : (
            <button
              onClick={() => setShowAnswers(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 mb-4"
            >
              Hide Answers
            </button>
          )}

          {showAnswers && quiz?.showResults !== false && (
            <div className="mt-6 text-left space-y-4">
              {questions.map((q, idx) => {
                const studentAnswer = answers[q._id];
                const isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(q.correctAnswer);
                return (
                  <div
                    key={q._id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      isCorrect
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white mb-1">{idx + 1}. {q.question}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Your answer: {JSON.stringify(studentAnswer)}</p>
                    {q.explanation && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{q.explanation}</p>}
                    <p className={`text-sm mt-1 font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Correct answer: {JSON.stringify(q.correctAnswer)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={() => navigate('/quizzes')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            >
              Back to Quizzes
            </button>
            <Link
              to={`/quizzes/${quizId}/leaderboard`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            >
              View Leaderboard
            </Link>
          </div>

          {leaderboard.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 3 Rankings
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 3).map((entry, idx) => {
                  const isCurrentUser = entry.student?._id === user?._id;
                  const rankColors = idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : 'text-orange-400';
                  const rankBg = idx === 0
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10'
                    : idx === 1
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50'
                    : 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10';
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        isCurrentUser
                          ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-lg'
                          : rankBg
                      }`}
                    >
                      <div className="flex items-center justify-center w-7">
                        {idx === 0 && <Trophy className="w-5 h-5 text-yellow-400" />}
                        {idx === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {idx === 2 && <Award className="w-5 h-5 text-orange-400" />}
                        {idx >= 3 && <span className={`font-bold text-sm ${rankColors}`}>#{idx + 1}</span>}
                      </div>
                      <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                          {entry.student?.firstName?.charAt(0)}{entry.student?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.student?.firstName} {entry.student?.lastName}
                          {entry.student?._id === user?._id && ' (You)'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.score}%</span>
                    </div>
                  );
                })}
                {!leaderboard.find(e => e.student?._id === user?._id) && result && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                    Your position: #{leaderboard.filter((e) => (e.score || 0) > (result.finalGrade || result.score || 0)).length + 1}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Quiz Score</p>
        </div>
        <div className="text-xl font-mono bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="font-medium text-gray-900 dark:text-white mb-2">{idx + 1}. {q.question}</p>
              {q.timeLimit && <span className="text-xs text-gray-500 dark:text-gray-400">{q.timeLimit}s</span>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{q.points} points</p>

            {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options?.length > 0 && (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-slate-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <input type="radio" name={`question-${q._id}`} value={opt} checked={answers[q._id] === opt} onChange={() => handleAnswer(q._id, opt)} className="text-indigo-600" />
                    <span className="text-gray-900 dark:text-gray-200">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'multiple_select' && q.options?.length > 0 && (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-slate-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <input type="checkbox" checked={(answers[q._id] || []).includes(opt)} onChange={e => handleMultiSelect(q._id, opt, e.target.checked)} className="text-indigo-600" />
                    <span className="text-gray-900 dark:text-gray-200">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {(q.type === 'short_answer' || q.type === 'essay') && (
              <textarea
                className="w-full border border-gray-200 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={q.type === 'essay' ? 6 : 2}
                value={answers[q._id] || ''}
                onChange={e => handleAnswer(q._id, e.target.value)}
                placeholder={q.type === 'essay' ? 'Write your essay...' : 'Your answer...'}
              />
            )}

            {q.type === 'code' && (
              <div>
                {q.codeTemplate && (
                  <pre className="bg-gray-100 dark:bg-slate-700 dark:text-gray-300 p-3 rounded-lg text-sm mb-2">{q.codeTemplate}</pre>
                )}
                <textarea
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-lg p-2 font-mono text-sm dark:bg-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="6"
                  value={answers[q._id] || ''}
                  onChange={e => handleAnswer(q._id, e.target.value)}
                  placeholder="Write your code here..."
                />
                {q.expectedOutput && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Expected output: <code className="bg-gray-100 dark:bg-slate-700 dark:text-gray-300 px-1 rounded">{q.expectedOutput}</code></p>
                )}
              </div>
            )}

            {q.type === 'drag_drop' && q.options?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">Drag items to match:</p>
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-200 px-2 py-1 rounded text-sm">{opt}</span>
                    <select className="border border-gray-200 dark:border-slate-600 rounded p-1 dark:bg-slate-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500" value={answers[q._id]?.[opt] || ''} onChange={e => handleMatching(q._id, opt, e.target.value)}>
                      <option value="">Select match</option>
                      {q.options.filter(o => o !== opt).map((o, j) => <option key={j} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {q.type === 'matching' && q.matchingPairs?.length > 0 && (
              <div className="space-y-2">
                {q.matchingPairs.map((pair, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-200 px-2 py-1 rounded text-sm">{pair.left}</span>
                    <select className="border border-gray-200 dark:border-slate-600 rounded p-1 dark:bg-slate-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500" value={answers[q._id]?.[pair.left] || ''} onChange={e => handleMatching(q._id, pair.left, e.target.value)}>
                      <option value="">Select match</option>
                      {q.matchingPairs.map((p, j) => <option key={j} value={p.right}>{p.right}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">{Object.keys(answers).length} of {questions.length} answered</p>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}