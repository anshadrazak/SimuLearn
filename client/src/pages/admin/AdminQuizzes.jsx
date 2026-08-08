import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../../services/quizApi';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { quizApi.getAllQuizzes().then(res => { setQuizzes(res.data); setLoading(false); }); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    await quizApi.deleteQuiz(id);
    setQuizzes(quizzes.filter(q => q._id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Quizzes</h1>
        <Link to="/admin/quizzes/new" className="bg-blue-600 text-white px-4 py-2 rounded">Create Quiz</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map(quiz => (
          <div key={quiz._id} className="border rounded p-4">
            <h2 className="font-semibold text-lg">{quiz.title}</h2>
            <p className="text-sm text-gray-600">{quiz.course?.title}</p>
            <p className="text-sm text-gray-600">Duration: {quiz.duration} min</p>
            <div className="mt-4 flex gap-2">
              <Link to={`/admin/quizzes/${quiz._id}`} className="text-blue-600 text-sm">Edit</Link>
              <button onClick={() => handleDelete(quiz._id)} className="text-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}