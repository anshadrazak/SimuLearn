import api from './api';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getCourses: () => api.get('/admin/courses'),
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  getAllAssignments: async () => {
    const courses = (await api.get('/courses')).data;
    const all = [];
    for (const c of courses) {
      const assignments = (await api.get(`/assignments/course/${c._id}`)).data;
      assignments.forEach(a => { a.courseName = c.title; all.push(a); });
    }
    return all;
  },
  createAssignment: (data) => api.post('/assignments', data),
  updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  getScenarios: () => api.get('/scenarios/all'),
  createScenario: (data) => api.post('/scenarios', data),
  updateScenario: (id, data) => api.put(`/scenarios/${id}`, data),
  deleteScenario: (id) => api.delete(`/scenarios/${id}`),
  getAllQuizzes: () => api.get('/quizzes/all'),
  createQuiz: (data) => api.post('/quizzes', data),
  updateQuiz: (id, data) => api.put(`/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  getAllLabs: () => api.get('/labs/all'),
  createLab: (data) => api.post('/labs', data),
  updateLab: (id, data) => api.put(`/labs/${id}`, data),
  deleteLab: (id) => api.delete(`/labs/${id}`),
  getCertificates: () => api.get('/certificates/all'),
  createCertificate: (data) => api.post('/certificates', data),
  updateCertificate: (id, data) => api.put(`/certificates/${id}`, data),
  deleteCertificate: (id) => api.delete(`/certificates/${id}`),
  revokeCertificate: (id) => api.patch(`/certificates/${id}/revoke`),
  getAnalyticsOverview: () => api.get('/admin/analytics'),
  getUserGrowth: () => api.get('/admin/analytics/user-growth'),
  getCourseStats: () => api.get('/admin/analytics/course-stats'),
  getEngagementStats: () => api.get('/admin/analytics/engagement'),
  getTopPerformers: () => api.get('/admin/analytics/top-performers'),
  getRoles: () => api.get('/roles'),
  createRole: (data) => api.post('/roles', data),
  updateRole: (id, data) => api.put(`/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get('/permissions'),
  createPermission: (data) => api.post('/permissions', data),
  updatePermission: (id, data) => api.put(`/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/permissions/${id}`),
  getAssets: () => api.get('/assets'),
  deleteAsset: (id) => api.delete(`/assets/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};