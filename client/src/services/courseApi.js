import api from './api';

export const courseApi = {
  getCourses: () => api.get('/courses'),
  getCourse: (id) => api.get(`/courses/${id}`),
  getFullCourse: (id) => api.get(`/courses/${id}/full`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  publishCourse: (id) => api.patch(`/courses/${id}/publish`),
  getAdminCourses: () => api.get('/courses/instructor'),
};

export const moduleApi = {
  getModules: (courseId) => api.get(`/modules/course/${courseId}`),
  createModule: (data) => api.post('/modules', data),
  updateModule: (id, data) => api.put(`/modules/${id}`, data),
  deleteModule: (id) => api.delete(`/modules/${id}`),
  reorderModules: (id, order) => api.patch(`/modules/${id}/reorder`, { order }),
};

export const lessonApi = {
  getLessons: (moduleId) => api.get(`/lessons/module/${moduleId}`),
  getLesson: (id) => api.get(`/lessons/${id}`),
  createLesson: (data) => api.post('/lessons', data),
  updateLesson: (id, data) => api.put(`/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  reorderLessons: (id, order) => api.patch(`/lessons/${id}/reorder`, { order }),
};

export const assetApi = {
  uploadAsset: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAssets: () => api.get('/assets'),
  deleteAsset: (id) => api.delete(`/assets/${id}`),
};