import api from './api';

export const progressApi = {
  trackVideoProgress: (lessonId, data) =>
    api.patch(`/progress/${lessonId}/progress`, data),
  getLessonProgress: (lessonId) =>
    api.get(`/progress/${lessonId}/progress`),
  getCourseProgress: (courseId) =>
    api.get(`/progress/course/${courseId}/progress`),
  checkLessonUnlock: (lessonId) =>
    api.get(`/progress/${lessonId}/unlocked`),
};