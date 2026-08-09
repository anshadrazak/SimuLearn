import api from './api';

export const enrollmentApi = {
  enroll: (courseId) => api.post(`/enrollments/course/${courseId}`),
  unenroll: (courseId) => api.delete(`/enrollments/course/${courseId}`),
  getMyEnrollments: () => api.get('/enrollments/my'),
  getCourseEnrollments: (courseId) => api.get(`/enrollments/course/${courseId}`),
  getEnrollment: (id) => api.get(`/enrollments/${id}`),
  updateProgress: (id, data) => api.patch(`/enrollments/${id}/progress`, data),
};
