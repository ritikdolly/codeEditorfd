import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth API ---
export const authService = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data),
};

// --- Admin API ---
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then(r => r.data),
  getAllUsers: () => api.get('/admin/users').then(r => r.data),
  getTeachers: () => api.get('/admin/teachers').then(r => r.data),
  getStudents: () => api.get('/admin/students').then(r => r.data),
};

// --- Teacher API ---
export const teacherService = {
  getQuestions: () => api.get('/teacher/questions').then(r => r.data),
  getQuestion: (id) => api.get(`/teacher/questions/${id}`).then(r => r.data),
  createQuestion: (data) => api.post('/teacher/questions', data).then(r => r.data),
  updateQuestion: (id, data) => api.put(`/teacher/questions/${id}`, data).then(r => r.data),
  deleteQuestion: (id) => api.delete(`/teacher/questions/${id}`).then(r => r.data),
  getTests: () => api.get('/teacher/tests').then(r => r.data),
  createTest: (data) => api.post('/teacher/tests', data).then(r => r.data),
  getTestQuestions: (testId) => api.get(`/teacher/tests/${testId}/questions`).then(r => r.data),
  getTestResults: (testId) => api.get(`/teacher/tests/${testId}/results`).then(r => r.data),
  getStudentTestDetails: (testId, studentId) => api.get(`/teacher/tests/${testId}/students/${studentId}/results`).then(r => r.data),
  getTestAnalytics: (testId) => api.get(`/teacher/tests/${testId}/analytics`).then(r => r.data),
};

// --- Student API ---
export const studentService = {
  getTest: (testId) => api.get(`/student/tests/${testId}`).then(r => r.data),
  getTestQuestions: (testId) => api.get(`/student/tests/${testId}/questions`).then(r => r.data),
  runCode: (data) => api.post('/student/code/run', data).then(r => r.data),
  submitCode: (data) => api.post('/student/submit', data).then(r => r.data),
  startAttempt: (testId) => api.post(`/student/attempts/${testId}/start`).then(r => r.data),
  submitAttempt: (testId) => api.post(`/student/attempts/${testId}/submit`).then(r => r.data),
  saveDraft: (testId, questionId, code) => api.put(`/student/attempts/${testId}/questions/${questionId}/draft`, { code }).then(r => r.data),
  getDraft: (testId, questionId) => api.get(`/student/attempts/${testId}/questions/${questionId}/draft`).then(r => r.data),
  getServerTime: () => api.get('/time').then(r => r.data),
};
