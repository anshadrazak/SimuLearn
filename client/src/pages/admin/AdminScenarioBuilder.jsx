import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scenarioApi } from '../../services/scenarioApi';

export default function AdminScenarioBuilder() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', backgroundStory: '', companyInfo: '', objectives: [], requirements: [],
    difficulty: 'medium', estimatedTime: 60, maxAttempts: 3, passingScore: 70, isPublished: false,
  });

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', instructions: '', type: 'text', options: ['', '', '', ''], correctAnswer: '', points: 10, sortOrder: 0, isRequired: true,
  });

  useEffect(() => {
    if (scenarioId && scenarioId !== 'new') {
      Promise.all([scenarioApi.getScenario(scenarioId), scenarioApi.getTasks(scenarioId)]).then(([scenarioRes, tasksRes]) => {
        setScenario(scenarioRes.data);
        setForm({
          title: scenarioRes.data.title || '', description: scenarioRes.data.description || '', backgroundStory: scenarioRes.data.backgroundStory || '',
          companyInfo: scenarioRes.data.companyInfo || '', objectives: scenarioRes.data.objectives || [], requirements: scenarioRes.data.requirements || [],
          difficulty: scenarioRes.data.difficulty || 'medium', estimatedTime: scenarioRes.data.estimatedTime || 60, maxAttempts: scenarioRes.data.maxAttempts || 3,
          passingScore: scenarioRes.data.passingScore || 70, isPublished: scenarioRes.data.isPublished || false,
        });
        setEvidence(scenarioRes.data.evidenceFiles || []);
        setTasks(tasksRes.data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [scenarioId]);

  const saveScenario = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = scenarioId === 'new' ? await scenarioApi.createScenario(form) : await scenarioApi.updateScenario(scenarioId, form);
    if (scenarioId === 'new') navigate(`/admin/scenarios/${res.data._id}`);
    setSaving(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await scenarioApi.uploadEvidence(scenario._id || scenarioId, file);
    setEvidence([...evidence, res.data]);
  };

  const removeEvidenceFile = async (assetId) => {
    await scenarioApi.removeEvidence(scenario._id || scenarioId, assetId);
    setEvidence(evidence.filter(f => f._id !== assetId));
  };

  const saveTask = async (e) => {
    e.preventDefault();
    const data = { ...taskForm };
    if (editingTask) {
      await scenarioApi.updateTask(editingTask._id, data);
      setTasks(tasks.map(t => t._id === editingTask._id ? { ...t, ...data } : t));
    } else {
      const res = await scenarioApi.addTask(scenario._id || scenarioId, data);
      setTasks([...tasks, res.data]);
    }
    setShowTaskForm(false);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', instructions: '', type: 'text', options: ['', '', '', ''], correctAnswer: '', points: 10, sortOrder: tasks.length, isRequired: true });
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete task?')) return;
    await scenarioApi.deleteTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };

  const openTask = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title || '', description: task.description || '', instructions: task.instructions || '',
        type: task.type || 'text', options: task.options || ['', '', '', ''], correctAnswer: task.correctAnswer || '',
        points: task.points || 10, sortOrder: task.sortOrder || 0, isRequired: task.isRequired !== false,
      });
    } else {
      setEditingTask(null);
      setTaskForm({ title: '', description: '', instructions: '', type: 'text', options: ['', '', '', ''], correctAnswer: '', points: 10, sortOrder: tasks.length, isRequired: true });
    }
    setShowTaskForm(true);
  };

  const updateOption = (index, value) => {
    const updated = [...taskForm.options];
    updated[index] = value;
    setTaskForm({ ...taskForm, options: updated });
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
      <h1 className="text-2xl font-bold">{scenarioId === 'new' ? 'New Scenario' : scenario?.title}</h1>
      <form onSubmit={saveScenario} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input className="w-full border rounded p-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded p-2" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Background Story</label>
          <textarea className="w-full border rounded p-2 font-mono text-sm" rows="6" value={form.backgroundStory} onChange={e => setForm({ ...form, backgroundStory: e.target.value })} placeholder="Set the scene for the scenario..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company Information</label>
          <textarea className="w-full border rounded p-2 font-mono text-sm" rows="4" value={form.companyInfo} onChange={e => setForm({ ...form, companyInfo: e.target.value })} placeholder="Company context, industry, size, etc." />
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
          <label className="block text-sm font-medium mb-1">Requirements</label>
          {form.requirements.map((req, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input className="flex-1 border rounded p-2" value={req} onChange={e => updateArrayItem('requirements', idx, e.target.value)} placeholder="Requirement" />
              <button type="button" onClick={() => removeArrayItem('requirements', idx)} className="text-red-600">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('requirements')} className="text-blue-600 text-sm">+ Add Requirement</button>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max Attempts</label>
            <input type="number" className="w-full border rounded p-2" value={form.maxAttempts} onChange={e => setForm({ ...form, maxAttempts: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
            <input type="number" className="w-full border rounded p-2" value={form.passingScore} onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Evidence Files</label>
          <input type="file" onChange={handleUpload} className="mb-2" />
          <div className="space-y-1">
            {evidence.map(file => (
              <div key={file._id} className="flex justify-between items-center border rounded p-2">
                <span>{file.originalName}</span>
                <button type="button" onClick={() => removeEvidenceFile(file._id)} className="text-red-600 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">{saving ? 'Saving...' : 'Save Scenario'}</button>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
            <span className="text-sm">Published</span>
          </label>
        </div>
      </form>

      {scenarioId !== 'new' && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <button onClick={() => setShowTaskForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Add Task</button>
          </div>
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task._id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.type} • {task.points} pts • {task.isRequired ? 'Required' : 'Optional'}</p>
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openTask(task)} className="text-blue-600 text-sm">Edit</button>
                    <button onClick={() => deleteTask(task._id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded w-full max-w-2xl my-8">
            <h3 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
            <form onSubmit={saveTask} className="space-y-4">
              <input className="w-full border rounded p-2" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              <textarea className="w-full border rounded p-2" placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              <textarea className="w-full border rounded p-2" placeholder="Instructions" value={taskForm.instructions} onChange={e => setTaskForm({ ...taskForm, instructions: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded p-2" value={taskForm.type} onChange={e => setTaskForm({ ...taskForm, type: e.target.value })}>
                    <option value="text">Text</option>
                    <option value="file_upload">File Upload</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="url">URL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Points</label>
                  <input type="number" className="w-full border rounded p-2" value={taskForm.points} onChange={e => setTaskForm({ ...taskForm, points: Number(e.target.value) })} />
                </div>
              </div>
              {(taskForm.type === 'multiple_choice' || taskForm.type === 'true_false') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Options</label>
                  {(taskForm.type === 'true_false' ? ['True', 'False'] : taskForm.options).map((opt, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input className="flex-1 border rounded p-2" value={opt} onChange={e => updateOption(idx, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Correct Answer</label>
                <input className="w-full border rounded p-2" value={taskForm.correctAnswer} onChange={e => setTaskForm({ ...taskForm, correctAnswer: e.target.value })} />
              </div>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={taskForm.isRequired} onChange={e => setTaskForm({ ...taskForm, isRequired: e.target.checked })} />
                <span className="text-sm">Required</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" onClick={() => { setShowTaskForm(false); setEditingTask(null); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}