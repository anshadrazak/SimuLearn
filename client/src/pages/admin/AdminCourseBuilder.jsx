import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi, moduleApi, lessonApi, assetApi } from '../../services/courseApi';
import { cloudinaryApi } from '../../services/cloudinaryApi';

export default function AdminCourseBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonModal, setLessonModal] = useState({ open: false, moduleId: null, lesson: null });
  const [moduleModal, setModuleModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const [courseForm, setCourseForm] = useState({ title: '', description: '', shortDescription: '', level: 'beginner', price: 0 });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', sortOrder: 0 });
  const [lessonForm, setLessonForm] = useState({
    title: '', description: '', contentType: 'text', content: '', videoUrl: '', duration: 0,
    attachments: [], images: [], externalLinks: [], codeBlocks: [], sortOrder: 0, isPublished: false, isFree: false,
  });

  useEffect(() => {
    if (courseId && courseId !== 'new') {
      Promise.all([courseApi.getCourse(courseId), moduleApi.getModules(courseId), assetApi.getAssets()]).then(([courseRes, modulesRes, assetsRes]) => {
        setCourse(courseRes.data);
        setCourseForm(courseRes.data);
        setModules(modulesRes.data);
        setAssets(assetsRes.data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [courseId]);

  const saveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = courseId === 'new' ? courseForm : { ...courseForm };
    const res = courseId === 'new' ? await courseApi.createCourse(data) : await courseApi.updateCourse(courseId, data);
    if (courseId === 'new') navigate(`/admin/courses/${res.data._id}`);
    setSaving(false);
  };

  const saveModule = async (e) => {
    e.preventDefault();
    const data = courseId === 'new' ? { ...moduleForm, course: course._id } : { ...moduleForm, course: courseId };
    if (lessonModal.moduleId) {
      const res = await moduleApi.updateModule(lessonModal.moduleId, data);
      setModules(modules.map(m => m._id === res.data._id ? res.data : m));
    } else {
      const res = await moduleApi.createModule(data);
      setModules([...modules, res.data]);
    }
    setModuleModal(false);
    setModuleForm({ title: '', description: '', sortOrder: 0 });
  };

  const deleteModule = async (id) => {
    if (!confirm('Delete module and all its lessons?')) return;
    await moduleApi.deleteModule(id);
    setModules(modules.filter(m => m._id !== id));
  };

  const openLesson = (moduleId, lesson = null) => {
    setLessonModal({ open: true, moduleId, lesson });
    if (lesson) {
      setLessonForm({
        title: lesson.title || '', description: lesson.description || '', contentType: lesson.contentType || 'text',
        content: lesson.content || '', videoUrl: lesson.videoUrl || '', duration: lesson.duration || 0,
        attachments: lesson.attachments || [], images: lesson.images || [], externalLinks: lesson.externalLinks || [],
        codeBlocks: lesson.codeBlocks || [], sortOrder: lesson.sortOrder || 0, isPublished: lesson.isPublished || false, isFree: lesson.isFree || false,
      });
    } else {
      setLessonForm({ title: '', description: '', contentType: 'text', content: '', videoUrl: '', duration: 0, attachments: [], images: [], externalLinks: [], codeBlocks: [], sortOrder: 0, isPublished: false, isFree: false });
    }
  };

  const saveLesson = async (e) => {
    e.preventDefault();
    const data = { ...lessonForm, module: lessonModal.moduleId, course: courseId === 'new' ? course._id : courseId };
    if (lessonModal.lesson) {
      const res = await lessonApi.updateLesson(lessonModal.lesson._id, data);
      setModules(modules.map(m => m._id === lessonModal.moduleId ? { ...m, lessons: m.lessons?.map(l => l._id === res.data._id ? res.data : l) } : m));
    } else {
      const res = await lessonApi.createLesson(data);
      setModules(modules.map(m => m._id === lessonModal.moduleId ? { ...m, lessons: [...(m.lessons || []), res.data] } : m));
    }
    setLessonModal({ open: false, moduleId: null, lesson: null });
  };

  const deleteLesson = async (moduleId, lessonId) => {
    if (!confirm('Delete lesson?')) return;
    await lessonApi.deleteLesson(lessonId);
    setModules(modules.map(m => m._id === moduleId ? { ...m, lessons: m.lessons?.filter(l => l._id !== lessonId) } : m));
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await assetApi.uploadAsset(file);
    setAssets([...assets, res.data]);
    setLessonForm({ ...lessonForm, attachments: [...lessonForm.attachments, res.data._id] });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    setVideoUploadProgress(0);
    try {
      const res = await cloudinaryApi.uploadVideo(file);
      setLessonForm({ ...lessonForm, videoUrl: res.data.url });
    } catch (err) {
      console.error('Video upload failed', err);
      alert('Failed to upload video');
    } finally {
      setUploadingVideo(false);
      setVideoUploadProgress(0);
    }
  };

  const addCodeBlock = () => setLessonForm({ ...lessonForm, codeBlocks: [...lessonForm.codeBlocks, { language: 'javascript', code: '' }] });
  const updateCodeBlock = (index, field, value) => {
    const updated = [...lessonForm.codeBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setLessonForm({ ...lessonForm, codeBlocks: updated });
  };
  const removeCodeBlock = (index) => setLessonForm({ ...lessonForm, codeBlocks: lessonForm.codeBlocks.filter((_, i) => i !== index) });
  const addExternalLink = () => setLessonForm({ ...lessonForm, externalLinks: [...lessonForm.externalLinks, { title: '', url: '' }] });
  const updateExternalLink = (index, field, value) => {
    const updated = [...lessonForm.externalLinks];
    updated[index] = { ...updated[index], [field]: value };
    setLessonForm({ ...lessonForm, externalLinks: updated });
  };
  const removeExternalLink = (index) => setLessonForm({ ...lessonForm, externalLinks: lessonForm.externalLinks.filter((_, i) => i !== index) });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{courseId === 'new' ? 'New Course' : course?.title}</h1>
      <form onSubmit={saveCourse} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input className="w-full border rounded p-2" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Short Description</label>
          <input className="w-full border rounded p-2" value={courseForm.shortDescription} onChange={e => setCourseForm({ ...courseForm, shortDescription: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded p-2" rows="4" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select className="w-full border rounded p-2" value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input type="number" className="w-full border rounded p-2" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: Number(e.target.value) })} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">{saving ? 'Saving...' : 'Save Course'}</button>
          {courseId !== 'new' && (
            <button type="button" onClick={async () => { await courseApi.publishCourse(courseId); window.location.reload(); }} className="bg-green-600 text-white px-4 py-2 rounded">Publish</button>
          )}
        </div>
      </form>

      {courseId !== 'new' && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Modules</h2>
            <button onClick={() => setModuleModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Add Module</button>
          </div>
          <div className="space-y-4">
            {modules.map(mod => (
              <div key={mod._id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{mod.title}</h3>
                    <p className="text-sm text-gray-600">{mod.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openLesson(mod._id)} className="text-blue-600 text-sm">Add Lesson</button>
                    <button onClick={() => { setModuleForm({ title: mod.title, description: mod.description, sortOrder: mod.sortOrder }); setLessonModal({ open: false, moduleId: mod._id, lesson: null }); setModuleModal(true); }} className="text-gray-600 text-sm">Edit</button>
                    <button onClick={() => deleteModule(mod._id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {mod.lessons?.map(lesson => (
                    <div key={lesson._id} className="flex justify-between items-center border-t pt-2">
                      <div>
                        <span className="font-medium">{lesson.title}</span>
                        <span className="ml-2 text-xs text-gray-500">{lesson.contentType}</span>
                        {lesson.isFree && <span className="ml-2 text-xs text-green-600">Free</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openLesson(mod._id, lesson)} className="text-blue-600 text-sm">Edit</button>
                        <button onClick={() => deleteLesson(mod._id, lesson._id)} className="text-red-600 text-sm">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {moduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{lessonModal.moduleId && !moduleForm.title ? 'Edit Module' : 'Add Module'}</h3>
            <form onSubmit={saveModule} className="space-y-4">
              <input className="w-full border rounded p-2" placeholder="Module title" value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} required />
              <textarea className="w-full border rounded p-2" placeholder="Description" value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" onClick={() => { setModuleModal(false); setModuleForm({ title: '', description: '', sortOrder: 0 }); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lessonModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded w-full max-w-3xl my-8">
            <h3 className="text-lg font-semibold mb-4">{lessonModal.lesson ? 'Edit Lesson' : 'Add Lesson'}</h3>
            <form onSubmit={saveLesson} className="space-y-4">
              <input className="w-full border rounded p-2" placeholder="Lesson title" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required />
              <textarea className="w-full border rounded p-2" placeholder="Description" value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Content Type</label>
                  <select className="w-full border rounded p-2" value={lessonForm.contentType} onChange={e => setLessonForm({ ...lessonForm, contentType: e.target.value })}>
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="audio">Audio</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <input type="number" className="w-full border rounded p-2" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: Number(e.target.value) })} />
                </div>
              </div>
              {lessonForm.contentType === 'video' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Upload Video</label>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo} className="mb-2" />
                  {uploadingVideo && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${videoUploadProgress}%` }} />
                    </div>
                  )}
                  {lessonForm.videoUrl && (
                    <p className="text-xs text-green-600">Video uploaded: {lessonForm.videoUrl.slice(0, 50)}...</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <input className="w-full border rounded p-2" placeholder="https://www.youtube.com/embed/..." value={lessonForm.videoUrl} onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rich Text Content (HTML supported)</label>
                <textarea className="w-full border rounded p-2 font-mono text-sm" rows="8" value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="<p>Write your lesson content here...</p>" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code Blocks</label>
                <div className="space-y-2">
                  {lessonForm.codeBlocks.map((block, idx) => (
                    <div key={idx} className="border rounded p-2">
                      <input className="w-full border rounded p-1 mb-1" placeholder="Language" value={block.language} onChange={e => updateCodeBlock(idx, 'language', e.target.value)} />
                      <textarea className="w-full border rounded p-1 font-mono text-sm" rows="3" value={block.code} onChange={e => updateCodeBlock(idx, 'code', e.target.value)} placeholder="// code here" />
                      <button type="button" onClick={() => removeCodeBlock(idx)} className="text-red-600 text-sm mt-1">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={addCodeBlock} className="text-blue-600 text-sm">+ Add Code Block</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Attachments</label>
                <input type="file" onChange={handleUpload} className="mb-2" />
                <div className="flex flex-wrap gap-2">
                  {lessonForm.attachments.map(id => {
                    const asset = assets.find(a => a._id === id);
                    return asset ? (
                      <span key={id} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-1">
                        {asset.originalName}
                        <button type="button" onClick={() => setLessonForm({ ...lessonForm, attachments: lessonForm.attachments.filter(a => a !== id) })} className="text-red-600">x</button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">External Links</label>
                <div className="space-y-2">
                  {lessonForm.externalLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input className="border rounded p-1 flex-1" placeholder="Title" value={link.title} onChange={e => updateExternalLink(idx, 'title', e.target.value)} />
                      <input className="border rounded p-1 flex-1" placeholder="URL" value={link.url} onChange={e => updateExternalLink(idx, 'url', e.target.value)} />
                      <button type="button" onClick={() => removeExternalLink(idx)} className="text-red-600">x</button>
                    </div>
                  ))}
                  <button type="button" onClick={addExternalLink} className="text-blue-600 text-sm">+ Add Link</button>
                </div>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={lessonForm.isPublished} onChange={e => setLessonForm({ ...lessonForm, isPublished: e.target.checked })} />
                  <span className="text-sm">Published</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={lessonForm.isFree} onChange={e => setLessonForm({ ...lessonForm, isFree: e.target.checked })} />
                  <span className="text-sm">Free Preview</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Lesson</button>
                <button type="button" onClick={() => setLessonModal({ open: false, moduleId: null, lesson: null })} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}