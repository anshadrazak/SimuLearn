import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../../services/quizApi';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([quizApi.getMyQuizResults(), quizApi.getQuizzes()]).then(([resultsRes, quizzesRes]) => {
      setResults(resultsRes.data);
      setQuizzes(quizzesRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getResultForQuiz = (quizId) => results.find(r => r.quiz?._id === quizId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quizzes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map(quiz => {
          const result = getResultForQuiz(quiz._id);
          return (
            <div key={quiz._id} className="border rounded p-4 hover:shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                  <div className="flex gap-2 mt-2 text-sm text-gray-500">
                    <span>{quiz.duration} min</span>
                    <span>•</span>
                    <span>Pass: {quiz.passingScore}%</span>
                    <span>•</span>
                    <span>{quiz.module?.title}</span>
                  </div>
                </div>
                {result && (
                  <span className={`px-2 py-1 rounded-full text-xs ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result.score}%
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/quizzes/${quiz._id}`} className="text-blue-600 hover:underline text-sm">
                  {result ? 'Retake Quiz' : 'Start Quiz'}
                </Link>
                <Link to={`/quizzes/${quiz._id}/leaderboard`} className="text-green-600 hover:underline text-sm">
                  Leaderboard
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}