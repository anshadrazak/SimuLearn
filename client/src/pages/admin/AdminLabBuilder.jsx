import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { labApi } from '../../services/labApi';

export default function AdminLabBuilder() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lab, setLab] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', objectives: [], scenario: '', instructions: '', difficulty: 'medium',
    estimatedTime: 60, maxAttempts: 3, resources: [], expectedOutput: '', hints: [], isPublished: false,
  });
  const [starterFiles, setStarterFiles] = useState([]);
  const [solutionFiles, setSolutionFiles] = useState([]);

  useEffect(() => {
    if (labId && labId !== 'new') {
      Promise.all([labApi.getLab(labId), labApi.getAssets()]).then(([labRes, assetsRes]) => {
        setLab(labRes.data);
        setForm({
          title: labRes.data.title || '', description: labRes.data.description || '', objectives: labRes.data.objectives || [],
          scenario: labRes.data.scenario || '', instructions: labRes.data.instructions || '', difficulty: labRes.data.difficulty || 'medium',
          estimatedTime: labRes.data.estimatedTime || 60, maxAttempts: labRes.data.maxAttempts || 3, resources: labRes.data.resources || [],
          expectedOutput: labRes.data.expectedOutput || '', hints: labRes.data.hints || [], isPublished: labRes.data.isPublished || false,
        });
        setStarterFiles(labRes.data.starterFiles || []);
        setSolutionFiles(labRes.data.solutionFiles || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [labId]);

  const saveLab = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = labId === 'new' ? form : { ...form };
    const res = labId === 'new' ? await labApi.createLab(data) : await labApi.updateLab(labId, data);
    if (labId === 'new') navigate(`/admin/labs/${res.data._id}`);
    setSaving(false);
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await labApi.uploadFile(lab._id || labId, formData, type);
    if (type === 'starter') setStarterFiles([...starterFiles, res.data]);
    else setSolutionFiles([...solutionFiles, res.data]);
  };

  const removeFile = async (fileId, type) => {
    await labApi.removeFile(lab._id || labId, fileId, type);
    if (type === 'starter') setStarterFiles(starterFiles.filter(f => f._id !== fileId));
    else setSolutionFiles(solutionFiles.filter(f => f._id !== fileId));
  };

  const addArrayItem = (field) => setForm({ ...form, [field]: [...form[field], ''] });
  const updateArrayItem = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };
  const removeArrayItem = (field, index) => setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{labId === 'new' ? 'New Lab' : lab?.title}</h1>
      <form onSubmit={saveLab} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input className="w-full border rounded p-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded p-2" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Objectives</label>
          {form.objectives.map((obj, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input className="flex-1 border rounded p-2" value={obj} onChange={e => updateArrayItem('objectives', idx, e.target.value)} placeholder="Objective" />
              <button type="button" onClick={() => removeArrayItem('objectives', idx)} className="text-red-600">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('objectives')} className="text-blue-600 text-sm">+ Add Objective</button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Scenario</label>
          <textarea className="w-full border rounded p-2 font-mono text-sm" rows="6" value={form.scenario} onChange={e => setForm({ ...form, scenario: e.target.value })} placeholder="Describe the lab scenario..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <textarea className="w-full border rounded p-2" rows="4" value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select className="w-full border rounded p-2" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Time (minutes)</label>
            <input type="number" className="w-full border rounded p-2" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expected Output</label>
          <textarea className="w-full border rounded p-2 font-mono text-sm" rows="4" value={form.expectedOutput} onChange={e => setForm({ ...form, expectedOutput: e.target.value })} placeholder="Expected output or result..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hints</label>
          {form.hints.map((hint, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input className="flex-1 border rounded p-2" value={hint} onChange={e => updateArrayItem('hints', idx, e.target.value)} placeholder="Hint" />
              <button type="button" onClick={() => removeArrayItem('hints', idx)} className="text-red-600">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('hints')} className="text-blue-600 text-sm">+ Add Hint</button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Resources</label>
          {form.resources.map((res, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input className="flex-1 border rounded p-2" value={res} onChange={e => updateArrayItem('resources', idx, e.target.value)} placeholder="https://..." />
              <button type="button" onClick={() => removeArrayItem('resources', idx)} className="text-red-600">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('resources')} className="text-blue-600 text-sm">+ Add Resource</button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Starter Files</label>
          <input type="file" onChange={e => handleUpload(e, 'starter')} className="mb-2" />
          <div className="space-y-1">
            {starterFiles.map(file => (
              <div key={file._id} className="flex justify-between items-center border rounded p-2">
                <span>{file.originalName}</span>
                <button type="button" onClick={() => removeFile(file._id, 'starter')} className="text-red-600 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Solution Files (Hidden from Students)</label>
          <input type="file" onChange={e => handleUpload(e, 'solution')} className="mb-2" />
          <div className="space-y-1">
            {solutionFiles.map(file => (
              <div key={file._id} className="flex justify-between items-center border rounded p-2">
                <span>{file.originalName}</span>
                <button type="button" onClick={() => removeFile(file._id, 'solution')} className="text-red-600 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">{saving ? 'Saving...' : 'Save Lab'}</button>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
            <span className="text-sm">Published</span>
          </label>
        </div>
      </form>
    </div>
  );
}