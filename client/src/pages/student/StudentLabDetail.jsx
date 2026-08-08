import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { labApi } from '../../services/labApi';

export default function StudentLabDetail() {
  const { labId } = useParams();
  const [lab, setLab] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    Promise.all([labApi.getLab(labId), labApi.getMySubmission(labId)]).then(([labRes, subRes]) => {
      setLab(labRes.data);
      setSubmission(subRes.data);
      setLoading(false);
    });
  }, [labId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('attachments', file));
    if (feedback) formData.append('content', feedback);

    const res = await labApi.submitLab(labId, formData);
    setSubmission(res.data);
    setSubmitting(false);
    setSelectedFiles([]);
    setFeedback('');
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const canSubmit = !submission || submission.status === 'returned' || (submission.attemptNumber < (lab?.maxAttempts || 3));
  const attemptsLeft = lab ? lab.maxAttempts - (submission?.attemptNumber || 0) : 0;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/labs" className="text-blue-600 hover:underline">&larr; Back to Labs</Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{lab.title}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs ${lab.difficulty === 'easy' ? 'bg-green-100 text-green-700' : lab.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{lab.difficulty}</span>
              <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{lab.estimatedTime} min</span>
              {lab.isPublished && <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">Published</span>}
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

        <p className="mt-4 text-gray-700">{lab.description}</p>
      </div>

      {lab.objectives?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Objectives</h2>
          <ul className="list-disc pl-5 space-y-1">
            {lab.objectives.map((obj, idx) => <li key={idx}>{obj}</li>)}
          </ul>
        </div>
      )}

      {lab.scenario && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Scenario</h2>
          <div className="prose max-w-none bg-gray-50 p-4 rounded border" dangerouslySetInnerHTML={{ __html: lab.scenario.replace(/\n/g, '<br>') }} />
        </div>
      )}

      {lab.instructions && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Instructions</h2>
          <div className="prose max-w-none bg-gray-50 p-4 rounded border" dangerouslySetInnerHTML={{ __html: lab.instructions.replace(/\n/g, '<br>') }} />
        </div>
      )}

      {lab.expectedOutput && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Expected Output</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">{lab.expectedOutput}</pre>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Starter Files</h2>
        {lab.starterFiles?.length > 0 ? (
          <div className="space-y-2">
            {lab.starterFiles.map(file => (
              <a key={file._id} href={file.url} download={file.originalName} className="flex items-center gap-2 text-blue-600 hover:underline">
                <span>📦</span>
                <span>{file.originalName}</span>
              </a>
            ))}
          </div>
        ) : <p className="text-gray-500">No starter files available.</p>}
      </div>

      {lab.resources?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Resources</h2>
          <ul className="space-y-2">
            {lab.resources.map((res, idx) => (
              <li key={idx}>
                <a href={res} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{res}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lab.hints?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Hints</h2>
          <ul className="list-disc pl-5 space-y-1">
            {lab.hints.map((hint, idx) => <li key={idx}>{hint}</li>)}
          </ul>
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
              <label className="block text-sm font-medium mb-1">Upload Completed Work (ZIP supported)</label>
              <input type="file" accept=".zip,.tar.gz,.tgz,.rar,.7z" multiple onChange={handleFileChange} className="mb-2" />
              {selectedFiles.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedFiles.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea className="w-full border rounded p-2" rows="3" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Any notes for admin..." />
            </div>
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
              {submitting ? 'Submitting...' : submission ? 'Resubmit' : 'Submit Lab'}
            </button>
            {lab && <p className="text-sm text-gray-500">Attempts left: {attemptsLeft}</p>}
          </form>
        )}
        {!canSubmit && (
          <p className="text-red-600">Maximum attempts reached. Contact admin for further assistance.</p>
        )}
      </div>
    </div>
  );
}