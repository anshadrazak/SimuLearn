import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scenarioApi } from '../../services/scenarioApi';

export default function AdminScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { scenarioApi.getAllScenarios().then(res => { setScenarios(res.data); setLoading(false); }); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this scenario?')) return;
    await scenarioApi.deleteScenario(id);
    setScenarios(scenarios.filter(s => s._id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Scenarios</h1>
        <Link to="/admin/scenarios/new" className="bg-blue-600 text-white px-4 py-2 rounded">Create Scenario</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map(scenario => (
          <div key={scenario._id} className="border rounded p-4">
            <h2 className="font-semibold text-lg">{scenario.title}</h2>
            <p className="text-sm text-gray-600">{scenario.course?.title}</p>
            <p className="text-sm text-gray-600">Difficulty: {scenario.difficulty}</p>
            <div className="mt-4 flex gap-2">
              <Link to={`/admin/scenarios/${scenario._id}`} className="text-blue-600 text-sm">Edit</Link>
              <button onClick={() => handleDelete(scenario._id)} className="text-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}