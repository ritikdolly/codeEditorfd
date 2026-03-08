import axios from "axios";

// Create an Axios instance with base URL configuration
export const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock interceptor for adding authentication (if needed later)
api.interceptors.request.use((config) => {
  // We can attach a mock or real User-Id header if needed by the backend
  return config;
});

// --- User Module API ---
export const userService = {
  createUser: async (userData) => {
    const res = await api.post("/users", userData);
    return res.data;
  },
  getAllUsers: async () => {
    const res = await api.get("/users");
    return res.data;
  },
  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  updateUser: async (id, userData) => {
    const res = await api.put(`/users/${id}`, userData);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

// --- Question Module API ---
export const questionService = {
  createQuestion: async (questionData) => {
    const res = await api.post("/questions", questionData);
    return res.data;
  },
  getAllQuestions: async () => {
    const res = await api.get("/questions");
    return res.data;
  },
  getQuestionById: async (id) => {
    const res = await api.get(`/questions/${id}`);
    return res.data;
  },
  updateQuestion: async (id, questionData) => {
    const res = await api.put(`/questions/${id}`, questionData);
    return res.data;
  },
  deleteQuestion: async (id) => {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },
};

// --- Test Case Module API ---
export const testCaseService = {
  createTestCase: async (testCaseData) => {
    // Expecting testCaseData to contain { question: { id: "..." }, inputData: "...", ... }
    const res = await api.post("/testcases", testCaseData);
    return res.data;
  },
  getTestCasesByQuestion: async (questionId) => {
    const res = await api.get(`/questions/${questionId}/testcases`);
    return res.data;
  },
  deleteTestCase: async (id) => {
    const res = await api.delete(`/testcases/${id}`);
    return res.data;
  },
};

// --- Test Module API ---
export const testService = {
  createTest: async (teacherId, testData) => {
    const res = await api.post("/tests", testData, {
      headers: { "User-Id": teacherId },
    });
    return res.data;
  },
  getAllTests: async () => {
    const res = await api.get("/tests");
    return res.data;
  },
  getTestById: async (id) => {
    const res = await api.get(`/tests/${id}`);
    return res.data;
  },
  deleteTest: async (id) => {
    const res = await api.delete(`/tests/${id}`);
    return res.data;
  },
  mapQuestionsToTest: async (testId, questionIds) => {
    const res = await api.post(`/tests/${testId}/questions`, { questionIds });
    return res.data;
  },
  joinTest: async (testId, studentId) => {
    const res = await api.post(`/tests/${testId}/join`, { studentId });
    return res.data;
  },
};

// --- Code Execution API ---
export const executionService = {
  runCode: async (questionId, language, code) => {
    const res = await api.post("/code/run", { questionId, language, code });
    return res.data;
  },
};

// --- Code Submission API ---
export const submissionService = {
  submitCode: async ({ studentId, questionId, language, code, testId }) => {
    const res = await api.post("/submissions", {
      studentId,
      questionId,
      language,
      code,
      testId,
    });
    return res.data;
  },
};

// --- Result Module API ---
export const resultService = {
  getTestResults: async (testId) => {
    const res = await api.get(`/tests/${testId}/results`);
    return res.data;
  },
};
