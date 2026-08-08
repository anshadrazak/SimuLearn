import api from './api';

export const quizApi = {
  getQuizzes: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getAllQuizzes: () => api.get('/quizzes/all'),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  getQuizWithQuestions: (id) => api.get(`/quizzes/${id}/questions`),
  createQuiz: (data) => api.post('/quizzes', data),
  updateQuiz: (id, data) => api.put(`/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion: (questionId, data) => api.put(`/quizzes/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/quizzes/questions/${questionId}`),
  startQuiz: (id) => api.get(`/quizzes/${id}/start`),
  submitQuiz: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getMyAttempts: (quizId) => api.get(`/quizzes/${quizId}/attempts/my`),
  getMyQuizResults: () => api.get('/quizzes/my-results'),
  getQuizAttempts: (quizId) => api.get(`/quizzes/${quizId}/attempts`),
  gradeQuiz: (attemptId, data) => api.patch(`/quizzes/attempts/${attemptId}/grade`, data),
  getQuizResults: (quizId) => api.get(`/quizzes/${quizId}/results`),
  getLeaderboard: (quizId) => api.get(`/quizzes/${quizId}/leaderboard`),
  getCourseLeaderboard: (courseId) => api.get(`/quizzes/course/${courseId}/leaderboard`),
};

export const questionBankApi = {
  getQuestionBanks: (courseId) => api.get(`/question-banks/course/${courseId}`),
  getQuestionBank: (id) => api.get(`/question-banks/${id}`),
  createQuestionBank: (data) => api.post('/question-banks', data),
  updateQuestionBank: (id, data) => api.put(`/question-banks/${id}`, data),
  deleteQuestionBank: (id) => api.delete(`/question-banks/${id}`),
  addQuestion: (bankId, data) => api.post(`/question-banks/${bankId}/questions`, data),
  removeQuestion: (bankId, questionId) => api.delete(`/question-banks/${bankId}/questions/${questionId}`),
};