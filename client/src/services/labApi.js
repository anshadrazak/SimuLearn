import api from './api';

export const labApi = {
  getLabs: (courseId) => api.get(`/labs/course/${courseId}`),
  getAllLabs: () => api.get('/labs/all'),
  getLab: (id) => api.get(`/labs/${id}`),
  createLab: (data) => api.post('/labs', data),
  updateLab: (id, data) => api.put(`/labs/${id}`, data),
  deleteLab: (id) => api.delete(`/labs/${id}`),
  uploadFile: (labId, formData, type) => {
    const url = type === 'starter' ? `/labs/${labId}/starter` : `/labs/${labId}/solution`;
    return api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  removeFile: (labId, assetId, type) => {
    const url = type === 'starter' ? `/labs/${labId}/starter/${assetId}` : `/labs/${labId}/solution/${assetId}`;
    return api.delete(url);
  },
  submitLab: (labId, formData) => api.post(`/labs/${labId}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getLabSubmissions: (labId) => api.get(`/labs/${labId}/submissions`),
  getMySubmission: (labId) => api.get(`/labs/${labId}/my-submission`),
  getMySubmissions: () => api.get('/labs/my-submissions'),
  reviewSubmission: (submissionId, data) => api.put(`/labs/submissions/${submissionId}/review`, data),
  getAssets: () => api.get('/assets'),
  getLabProgress: (courseId) => api.get(`/labs/progress/course/${courseId}`),
};