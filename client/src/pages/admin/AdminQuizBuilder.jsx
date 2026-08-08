import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../../services/quizApi';

export default function AdminQuizBuilder() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [quizForm, setQuizForm] = useState({
    title: '', description: '', duration: 30, passingScore: 70, maxAttempts: 3,
    shuffleQuestions: false, showResults: true, showAnswers: true, allowReview: true, certificateOnPass: false, isPublished: false,
  });

  const [questionForm, setQuestionForm] = useState({
    type: 'multiple_choice', question: '', options: ['', '', '', ''], correctAnswer: '', matchingPairs: [],
    codeTemplate: '', expectedOutput: '', language: 'javascript', explanation: '', points: 1,
    difficulty: 'medium', tags: [], timeLimit: 0, sortOrder: 0, isRequired: true,
  });

  useEffect(() => {
    if (quizId && quizId !== 'new') {
      Promise.all([quizApi.getQuiz(quizId), quizApi.getQuizWithQuestions(quizId)]).then(([quizRes, questionsRes]) => {
        setQuiz(quizRes.data);
        setQuizForm(quizRes.data);
        setQuestions(questionsRes.data.questions || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [quizId]);

  const saveQuiz = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = quizId === 'new' ? await quizApi.createQuiz(quizForm) : await quizApi.updateQuiz(quizId, quizForm);
    if (quizId === 'new') navigate(`/admin/quizzes/${res.data._id}`);
    setSaving(false);
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    const data = { ...questionForm };
    if (editingQuestion) {
      await quizApi.updateQuestion(editingQuestion._id, data);
      setQuestions(questions.map(q => q._id === editingQuestion._id ? { ...q, ...data } : q));
    } else {
      const res = await quizApi.addQuestion(quiz._id || quizId, data);
      setQuestions([...questions, res.data]);
    }
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setQuestionForm({ type: 'multiple_choice', question: '', options: ['', '', '', ''], correctAnswer: '', matchingPairs: [], codeTemplate: '', expectedOutput: '', language: 'javascript', explanation: '', points: 1, difficulty: 'medium', tags: [], timeLimit: 0, sortOrder: 0, isRequired: true });
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Delete question?')) return;
    await quizApi.deleteQuestion(id);
    setQuestions(questions.filter(q => q._id !== id));
  };

  const openQuestion = (q = null) => {
    if (q) {
      setEditingQuestion(q);
      setQuestionForm({
        type: q.type, question: q.question, options: q.options || ['', '', '', ''], correctAnswer: q.correctAnswer || '',
        matchingPairs: q.matchingPairs || [], codeTemplate: q.codeTemplate || '', expectedOutput: q.expectedOutput || '',
        language: q.language || 'javascript', explanation: q.explanation || '', points: q.points || 1,
        difficulty: q.difficulty || 'medium', tags: q.tags || [], timeLimit: q.timeLimit || 0, sortOrder: q.sortOrder || 0, isRequired: q.isRequired !== false,
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({ type: 'multiple_choice', question: '', options: ['', '', '', ''], correctAnswer: '', matchingPairs: [], codeTemplate: '', expectedOutput: '', language: 'javascript', explanation: '', points: 1, difficulty: 'medium', tags: [], timeLimit: 0, sortOrder: questions.length, isRequired: true });
    }
    setShowQuestionForm(true);
  };

  const updateOption = (index, value) => {
    const updated = [...questionForm.options];
    updated[index] = value;
    setQuestionForm({ ...questionForm, options: updated });
  };

  const addMatchingPair = () => setQuestionForm({ ...questionForm, matchingPairs: [...questionForm.matchingPairs, { left: '', right: '' }] });
  const updateMatchingPair = (index, field, value) => {
    const updated = [...questionForm.matchingPairs];
    updated[index] = { ...updated[index], [field]: value };
    setQuestionForm({ ...questionForm, matchingPairs: updated });
  };
  const removeMatchingPair = (index) => setQuestionForm({ ...questionForm, matchingPairs: questionForm.matchingPairs.filter((_, i) => i !== index) });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{quizId === 'new' ? 'New Quiz' : quiz?.title}</h1>
      <form onSubmit={saveQuiz} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input className="w-full border rounded p-2" value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded p-2" rows="3" value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input type="number" className="w-full border rounded p-2" value={quizForm.duration} onChange={e => setQuizForm({ ...quizForm, duration: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
            <input type="number" className="w-full border rounded p-2" value={quizForm.passingScore} onChange={e => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Attempts</label>
            <input type="number" className="w-full border rounded p-2" value={quizForm.maxAttempts} onChange={e => setQuizForm({ ...quizForm, maxAttempts: Number(e.target.value) })} />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={quizForm.shuffleQuestions} onChange={e => setQuizForm({ ...quizForm, shuffleQuestions: e.target.checked })} />
            <span className="text-sm">Shuffle Questions</span>
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={quizForm.showResults} onChange={e => setQuizForm({ ...quizForm, showResults: e.target.checked })} />
            <span className="text-sm">Show Results</span>
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={quizForm.isPublished} onChange={e => setQuizForm({ ...quizForm, isPublished: e.target.checked })} />
            <span className="text-sm">Published</span>
          </label>
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">{saving ? 'Saving...' : 'Save Quiz'}</button>
      </form>

      {quizId !== 'new' && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button onClick={() => setShowQuestionForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Add Question</button>
          </div>
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q._id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{idx + 1}. {q.question}</p>
                    <p className="text-sm text-gray-600">{q.type} • {q.points} pts • {q.difficulty}</p>
                    {q.options?.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
                        {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                      </ul>
                    )}
                    {q.matchingPairs?.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
                        {q.matchingPairs.map((pair, i) => <li key={i}>{pair.left} → {pair.right}</li>)}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openQuestion(q)} className="text-blue-600 text-sm">Edit</button>
                    <button onClick={() => deleteQuestion(q._id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded w-full max-w-2xl my-8">
            <h3 className="text-lg font-semibold mb-4">{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
            <form onSubmit={saveQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded p-2" value={questionForm.type} onChange={e => setQuestionForm({ ...questionForm, type: e.target.value })}>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="multiple_select">Multiple Select</option>
                    <option value="true_false">True / False</option>
                    <option value="code">Code</option>
                    <option value="essay">Essay</option>
                    <option value="drag_drop">Drag and Drop</option>
                    <option value="matching">Matching</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select className="w-full border rounded p-2" value={questionForm.difficulty} onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea className="w-full border rounded p-2" rows="2" value={questionForm.question} onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })} required />
              </div>
              {(questionForm.type === 'multiple_choice' || questionForm.type === 'multiple_select' || questionForm.type === 'true_false') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Options</label>
                  {(questionForm.type === 'true_false' ? ['True', 'False'] : questionForm.options).map((opt, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input className="flex-1 border rounded p-2" value={opt} onChange={e => updateOption(idx, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
              {questionForm.type === 'multiple_select' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Correct Answers (comma separated)</label>
                  <input className="w-full border rounded p-2" value={Array.isArray(questionForm.correctAnswer) ? questionForm.correctAnswer.join(', ') : questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value.split(',').map(s => s.trim()) })} />
                </div>
              )}
              {questionForm.type === 'matching' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Matching Pairs</label>
                  {questionForm.matchingPairs.map((pair, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input className="flex-1 border rounded p-2" placeholder="Left" value={pair.left} onChange={e => updateMatchingPair(idx, 'left', e.target.value)} />
                      <input className="flex-1 border rounded p-2" placeholder="Right" value={pair.right} onChange={e => updateMatchingPair(idx, 'right', e.target.value)} />
                      <button type="button" onClick={() => removeMatchingPair(idx)} className="text-red-600">x</button>
                    </div>
                  ))}
                  <button type="button" onClick={addMatchingPair} className="text-blue-600 text-sm">+ Add Pair</button>
                </div>
              )}
              {questionForm.type === 'code' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Code Template</label>
                    <textarea className="w-full border rounded p-2 font-mono text-sm" rows="4" value={questionForm.codeTemplate} onChange={e => setQuestionForm({ ...questionForm, codeTemplate: e.target.value })} placeholder="// starter code" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Output</label>
                    <input className="w-full border rounded p-2" value={questionForm.expectedOutput} onChange={e => setQuestionForm({ ...questionForm, expectedOutput: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select className="w-full border rounded p-2" value={questionForm.language} onChange={e => setQuestionForm({ ...questionForm, language: e.target.value })}>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Correct Answer / Explanation</label>
                {questionForm.type === 'essay' ? (
                  <textarea className="w-full border rounded p-2" rows="3" value={questionForm.explanation} onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })} placeholder="Grading notes" />
                ) : (
                  <input className="w-full border rounded p-2" value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Points</label>
                  <input type="number" className="w-full border rounded p-2" value={questionForm.points} onChange={e => setQuestionForm({ ...questionForm, points: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Limit (seconds, optional)</label>
                  <input type="number" className="w-full border rounded p-2" value={questionForm.timeLimit} onChange={e => setQuestionForm({ ...questionForm, timeLimit: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" onClick={() => { setShowQuestionForm(false); setEditingQuestion(null); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}