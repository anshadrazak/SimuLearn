import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { labApi } from '../../services/labApi';

export default function StudentLabs() {
  const [labs, setLabs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([labApi.getLabs(), labApi.getMySubmissions()]).then(([labsRes, subsRes]) => {
      setLabs(labsRes.data);
      setSubmissions(subsRes.data);
      setLoading(false);
    });
  }, []);

  const getSubmissionForLab = (labId) => submissions.find(s => s.lab?._id === labId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Practical Labs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {labs.map(lab => {
          const submission = getSubmissionForLab(lab._id);
          return (
            <div key={lab._id} className="border rounded p-4 hover:shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{lab.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{lab.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${lab.difficulty === 'easy' ? 'bg-green-100 text-green-700' : lab.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{lab.difficulty}</span>
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{lab.estimatedTime} min</span>
                  </div>
                </div>
                {submission && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    submission.status === 'completed' ? 'bg-green-100 text-green-700' :
                    submission.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                    submission.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {submission.status}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <Link to={`/labs/${lab._id}`} className="text-blue-600 hover:underline text-sm">
                  {submission ? 'View Lab / Resubmit' : 'Start Lab'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}