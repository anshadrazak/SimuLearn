import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scenarioApi } from '../../services/scenarioApi';

export default function StudentScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([scenarioApi.getMyScenarioSubmissions(), scenarioApi.getScenarios()]).then(([subsRes, scenariosRes]) => {
      setSubmissions(subsRes.data);
      setScenarios(scenariosRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getSubmissionForScenario = (scenarioId) => submissions.find(s => s.scenario?._id === scenarioId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scenarios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map(scenario => {
          const submission = getSubmissionForScenario(scenario._id);
          return (
            <div key={scenario._id} className="border rounded p-4 hover:shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{scenario.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${scenario.difficulty === 'easy' ? 'bg-green-100 text-green-700' : scenario.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{scenario.difficulty}</span>
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{scenario.estimatedTime} min</span>
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
                <Link to={`/scenarios/${scenario._id}`} className="text-blue-600 hover:underline text-sm">
                  {submission ? 'View Scenario / Resubmit' : 'Start Scenario'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}