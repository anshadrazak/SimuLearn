import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scenarioApi } from '../../services/scenarioApi';

export default function StudentScenarioDetail() {
  const { scenarioId } = useParams();
  const [scenario, setScenario] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    Promise.all([scenarioApi.getScenario(scenarioId), scenarioApi.getTasks(scenarioId), scenarioApi.getMyScenarioSubmission(scenarioId)]).then(([scenarioRes, tasksRes, subRes]) => {
      setScenario(scenarioRes.data);
      setTasks(tasksRes.data);
      setSubmission(subRes.data);
      setLoading(false);
    });
  }, [scenarioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    attachments.forEach(file => formData.append('attachments', file));
    formData.append('answers', JSON.stringify(answers));
    formData.append('content', content);

    const res = await scenarioApi.submitScenario(scenarioId, formData);
    setSubmission(res.data);
    setSubmitting(false);
    setAttachments([]);
    setContent('');
    setAnswers({});
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const canSubmit = !submission || submission.status === 'returned' || (submission.attemptNumber < (scenario?.maxAttempts || 3));
  const attemptsLeft = scenario ? scenario.maxAttempts - (submission?.attemptNumber || 0) : 0;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/scenarios" className="text-blue-600 hover:underline">&larr; Back to Scenarios</Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{scenario.title}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs ${scenario.difficulty === 'easy' ? 'bg-green-100 text-green-700' : scenario.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{scenario.difficulty}</span>
              <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{scenario.estimatedTime} min</span>
              {scenario.isPublished && <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">Published</span>}
            </div>
          </div>
          {submission && (
            <span className={`px-3 py-1 rounded-full text-sm ${
              submission.status === 'completed' ? 'bg-green-100 text-green-700' :
              submission.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
              submission.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {submission.status}
            </span>
          )}
        </div>

        {scenario.backgroundStory && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Background Story</h2>
            <div className="prose max-w-none bg-gray-50 p-4 rounded border" dangerouslySetInnerHTML={{ __html: scenario.backgroundStory.replace(/\n/g, '<br>') }} />
          </div>
        )}

        {scenario.companyInfo && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Company Information</h2>
            <div className="prose max-w-none bg-gray-50 p-4 rounded border" dangerouslySetInnerHTML={{ __html: scenario.companyInfo.replace(/\n/g, '<br>') }} />
          </div>
        )}

        {scenario.objectives?.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Objectives</h2>
            <ul className="list-disc pl-5 space-y-1">
              {scenario.objectives.map((obj, idx) => <li key={idx}>{obj}</li>)}
            </ul>
          </div>
        )}

        {scenario.requirements?.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Requirements</h2>
            <ul className="list-disc pl-5 space-y-1">
              {scenario.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
            </ul>
          </div>
        )}
      </div>

      {scenario.evidenceFiles?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Evidence Files</h2>
          <div className="space-y-2">
            {scenario.evidenceFiles.map(file => (
              <a key={file._id} href={file.url} download={file.originalName} className="flex items-center gap-2 text-blue-600 hover:underline">
                <span>📎</span>
                <span>{file.originalName}</span>
                <span className="text-xs text-gray-500">({file.mimetype})</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div key={task._id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Task {idx + 1}: {task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <p className="text-sm text-gray-500 mt-1">{task.instructions}</p>
                    <span className="text-xs text-gray-500 mt-2 block">{task.points} points • {task.isRequired ? 'Required' : 'Optional'}</span>
                  </div>
                </div>
                {canSubmit && (
                  <div className="mt-3">
                    {task.type === 'text' && (
                      <textarea
                        className="w-full border rounded p-2"
                        rows="3"
                        value={answers[task._id] || ''}
                        onChange={e => setAnswers({ ...answers, [task._id]: e.target.value })}
                        placeholder="Your answer..."
                      />
                    )}
                    {task.type === 'file_upload' && (
                      <input type="file" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAttachments([...attachments, file]);
                          setAnswers({ ...answers, [task._id]: file.name });
                        }
                      }} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Your Submission</h2>
        {submission && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Attempt #{submission.attemptNumber} • Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
            {submission.feedback && (
              <div className="mt-2">
                <p className="font-medium">Feedback:</p>
                <p className="text-gray-700">{submission.feedback}</p>
              </div>
            )}
            {submission.grade !== undefined && (
              <p className="mt-2">Grade: <span className="font-bold">{submission.grade}</span></p>
            )}
          </div>
        )}
        {canSubmit && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea className="w-full border rounded p-2" rows="4" value={content} onChange={e => setContent(e.target.value)} placeholder="Any additional notes..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Attachments</label>
              <input type="file" multiple onChange={handleFileChange} className="mb-2" />
              {attachments.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected: {attachments.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
              {submitting ? 'Submitting...' : submission ? 'Resubmit' : 'Submit Scenario'}
            </button>
            {scenario && <p className="text-sm text-gray-500">Attempts left: {attemptsLeft}</p>}
          </form>
        )}
        {!canSubmit && (
          <p className="text-red-600">Maximum attempts reached. Contact admin for further assistance.</p>
        )}
      </div>
    </div>
  );
}