import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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

// Handle 401 (expired/invalid token) — clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth API ---
export const authService = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  verifyRegistration: (data) => api.post('/auth/verify-registration', data).then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  requestLoginOtp: (data) => api.post('/auth/request-login-otp', data).then(r => r.data),
  loginOtp: (data) => api.post('/auth/login-otp', data).then(r => r.data),
  googleLogin: (data) => api.post('/auth/google-login', data).then(r => r.data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then(r => r.data),
  resetPassword: (data) => api.post('/auth/reset-password', data).then(r => r.data),
  changePassword: (data) => api.put('/auth/change-password', data).then(r => r.data),
  requestChangePasswordOtp: () => api.post('/auth/request-change-password-otp').then(r => r.data),
  setupCampus: (data) => api.post('/campus/setup', data).then(r => r.data),
  joinCampus: (campusId) => api.post(`/campus/join?campusId=${campusId}`).then(r => r.data),
  getActiveCampuses: () => api.get('/campus/active').then(r => r.data),
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
// --- Password Reset ---
export const passwordResetService = {
  request: (data) => api.post('/auth/reset-password/request', data).then(r => r.data),
  confirm: (data) => api.post('/auth/reset-password/confirm', data).then(r => r.data),
  validate: (token) => api.get(`/auth/reset-password/validate?token=${token}`).then(r => r.data),
};

// --- Campus (SUPER_ADMIN) ---
export const campusService = {
  create: (data) => api.post('/campus', data).then(r => r.data),
  getAll: () => api.get('/campus').then(r => r.data),
  getOne: (id) => api.get(`/campus/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/campus/${id}`, data).then(r => r.data),
  deactivate: (id) => api.delete(`/campus/${id}`).then(r => r.data),
};

// --- Departments ---
export const departmentService = {
  create: (data) => api.post('/departments', data).then(r => r.data),
  getByCampus: (campusId) => api.get(`/departments/campus/${campusId}`).then(r => r.data),
  getOne: (id) => api.get(`/departments/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/departments/${id}`, data).then(r => r.data),
  assignHod: (id, userId) => api.post(`/departments/${id}/assign-hod`, { userId }).then(r => r.data),
  deactivate: (id) => api.delete(`/departments/${id}`).then(r => r.data),
};

// --- Batches ---
export const batchService = {
  create: (data) => api.post('/batches', data).then(r => r.data),
  getByDepartment: (deptId) => api.get(`/batches/department/${deptId}`).then(r => r.data),
  getByCampus: (campusId) => api.get(`/batches/campus/${campusId}`).then(r => r.data),
  createSection: (batchId, data) => api.post(`/batches/${batchId}/sections`, data).then(r => r.data),
  getSections: (batchId) => api.get(`/batches/${batchId}/sections`).then(r => r.data),
};

// --- Campus Admin - User Management ---
export const campusAdminService = {
  createUser: (data) => api.post('/campus-admin/users', data).then(r => r.data),
  listUsers: (campusId, page = 0, size = 20) => api.get(`/campus-admin/users?campusId=${campusId}&page=${page}&size=${size}`).then(r => r.data),
  getUser: (id) => api.get(`/campus-admin/users/${id}`).then(r => r.data),
  updateUser: (id, data) => api.put(`/campus-admin/users/${id}`, data).then(r => r.data),
  activateUser: (id) => api.patch(`/campus-admin/users/${id}/activate`).then(r => r.data),
  deactivateUser: (id) => api.patch(`/campus-admin/users/${id}/deactivate`).then(r => r.data),
  assignRole: (id, role) => api.patch(`/campus-admin/users/${id}/role`, { role }).then(r => r.data),
  getUsersByRole: (role, campusId) => api.get(`/campus-admin/users/role/${role}?campusId=${campusId}`).then(r => r.data),
  previewUpload: (file) => { const f = new FormData(); f.append('file', file); return api.post('/campus-admin/bulk-upload/preview', f, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data); },
  processUpload: (file, campusId) => { const f = new FormData(); f.append('file', file); return api.post(`/campus-admin/bulk-upload/process?campusId=${campusId}`, f, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data); },
};

// --- Audit Logs ---
export const auditLogService = {
  getLogs: (page = 0, size = 30) => api.get(`/audit-logs?page=${page}&size=${size}`).then(r => r.data),
  getByUser: (userId, page = 0) => api.get(`/audit-logs/user/${userId}?page=${page}`).then(r => r.data),
};

// --- Dean ---
export const deanService = {
  getStudents: () => api.get('/dean/students').then(r => r.data),
  getTeachers: () => api.get('/dean/teachers').then(r => r.data),
  getAcademicStaff: (role = 'HOD') => api.get(`/dean/staff-academic?role=${role}`).then(r => r.data),
};

// --- HOD ---
export const hodService = {
  getTeachers: () => api.get('/hod/teachers').then(r => r.data),
  getStudents: () => api.get('/hod/students').then(r => r.data),
  getMentors: () => api.get('/hod/mentors').then(r => r.data),
  assignMentor: (sectionId, mentorId) => api.post('/hod/assign-mentor', { sectionId, mentorId }).then(r => r.data),
};

// --- Mentor ---
export const mentorService = {
  getStudents: () => api.get('/mentor/students').then(r => r.data),
};

// --- Super Admin ---
export const superAdminService = {
  // Staff
  createStaff: (data) => api.post('/super-admin/staff', data).then(r => r.data),
  listStaff: () => api.get('/super-admin/staff').then(r => r.data),
  updateStaffPermissions: (id, data) => api.put(`/super-admin/staff/${id}/permissions`, data).then(r => r.data),
  getStaffPermissions: (id) => api.get(`/super-admin/staff/${id}/permissions`).then(r => r.data),
  // Global users
  globalSearch: (params) => api.get('/super-admin/users', { params }).then(r => r.data),
  forcePasswordReset: (id) => api.patch(`/super-admin/users/${id}/force-reset`).then(r => r.data),
  lockAccount: (id) => api.patch(`/super-admin/users/${id}/lock`).then(r => r.data),
  unlockAccount: (id) => api.patch(`/super-admin/users/${id}/unlock`).then(r => r.data),
  // Campus admin assignment
  createCampusAdmin: (campusId, data) => api.post(`/super-admin/campuses/${campusId}/admins`, data).then(r => r.data),
  assignCampusAdmin: (campusId, userId) => api.post(`/super-admin/campuses/${campusId}/assign-admin?userId=${userId}`).then(r => r.data),
  removeCampusAdmin: (campusId, userId) => api.delete(`/super-admin/campuses/${campusId}/admins/${userId}`).then(r => r.data),
  // Campus lifecycle
  changeCampusStatus: (id, data) => api.patch(`/super-admin/campuses/${id}/status`, data).then(r => r.data),
  updateCampusConfig: (id, data) => api.put(`/super-admin/campuses/${id}/config`, data).then(r => r.data),
  getCampusStats: (id) => api.get(`/super-admin/campuses/${id}/stats`).then(r => r.data),
  // Stats
  getPlatformStats: () => api.get('/super-admin/stats').then(r => r.data),
};

// --- Subscriptions ---
export const subscriptionService = {
  createPlan: (data) => api.post('/super-admin/subscriptions/plans', data).then(r => r.data),
  updatePlan: (id, data) => api.put(`/super-admin/subscriptions/plans/${id}`, data).then(r => r.data),
  getAllPlans: () => api.get('/super-admin/subscriptions/plans').then(r => r.data),
  assignPlan: (data) => api.post('/super-admin/subscriptions/assign', data).then(r => r.data),
  getCampusSubscriptions: (campusId) => api.get(`/super-admin/subscriptions/campus/${campusId}`).then(r => r.data),
};
