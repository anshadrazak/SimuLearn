import api from './api';

export const scenarioApi = {
  getScenarios: (courseId) => api.get(`/scenarios/course/${courseId}`),
  getAllScenarios: () => api.get('/scenarios/all'),
  getScenario: (id) => api.get(`/scenarios/${id}`),
  getFullScenario: (id) => api.get(`/scenarios/${id}/full`),
  createScenario: (data) => api.post('/scenarios', data),
  updateScenario: (id, data) => api.put(`/scenarios/${id}`, data),
  deleteScenario: (id) => api.delete(`/scenarios/${id}`),
  uploadEvidence: (scenarioId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/scenarios/${scenarioId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeEvidence: (scenarioId, assetId) => api.delete(`/scenarios/${scenarioId}/evidence/${assetId}`),
  addTask: (scenarioId, data) => api.post(`/scenarios/${scenarioId}/tasks`, data),
  getTasks: (scenarioId) => api.get(`/scenarios/${scenarioId}/tasks`),
  updateTask: (taskId, data) => api.put(`/scenarios/tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/scenarios/tasks/${taskId}`),
  submitScenario: (scenarioId, data) => api.post(`/scenarios/${scenarioId}/submit`, data),
  getScenarioSubmissions: (scenarioId) => api.get(`/scenarios/${scenarioId}/submissions`),
  getMyScenarioSubmission: (scenarioId) => api.get(`/scenarios/${scenarioId}/my-submission`),
  reviewScenarioSubmission: (submissionId, data) => api.put(`/scenarios/submissions/${submissionId}/review`, data),
  getMyScenarioSubmissions: () => api.get('/scenarios/my-submissions'),
  getScenarioProgress: (courseId) => api.get(`/scenarios/progress/course/${courseId}`),
};