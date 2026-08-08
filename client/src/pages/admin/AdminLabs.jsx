import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { labApi } from '../../services/labApi';

export default function AdminLabs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { labApi.getAllLabs().then(res => { setLabs(res.data); setLoading(false); }); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this lab?')) return;
    await labApi.deleteLab(id);
    setLabs(labs.filter(l => l._id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Labs</h1>
        <Link to="/admin/labs/new" className="bg-blue-600 text-white px-4 py-2 rounded">Create Lab</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labs.map(lab => (
          <div key={lab._id} className="border rounded p-4">
            <h2 className="font-semibold text-lg">{lab.title}</h2>
            <p className="text-sm text-gray-600">{lab.course?.title}</p>
            <p className="text-sm text-gray-600">Difficulty: {lab.difficulty}</p>
            <div className="mt-4 flex gap-2">
              <Link to={`/admin/labs/${lab._id}`} className="text-blue-600 text-sm">Edit</Link>
              <button onClick={() => handleDelete(lab._id)} className="text-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}