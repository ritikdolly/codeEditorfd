import { useState, useEffect, useCallback } from "react";
import {
  userService,
  questionService,
  testCaseService,
  testService,
  executionService,
  submissionService,
  resultService,
} from "../services/api";

// ─── Generic Fetch Hook ───────────────────────────────
function useApi(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ─── User Hooks ───────────────────────────────────────
export function useUsers() {
  return useApi(() => userService.getAllUsers());
}

export function useUser(id) {
  return useApi(() => userService.getUserById(id), [id]);
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const createUser = async (userData) => {
    setLoading(true);
    try {
      return await userService.createUser(userData);
    } finally {
      setLoading(false);
    }
  };
  return { createUser, loading };
}

// ─── Question Hooks ───────────────────────────────────
export function useQuestions() {
  return useApi(() => questionService.getAllQuestions());
}

export function useQuestion(id) {
  return useApi(() => questionService.getQuestionById(id), [id]);
}

export function useCreateQuestion() {
  const [loading, setLoading] = useState(false);
  const createQuestion = async (data) => {
    setLoading(true);
    try {
      return await questionService.createQuestion(data);
    } finally {
      setLoading(false);
    }
  };
  return { createQuestion, loading };
}

// ─── Test Hooks ───────────────────────────────────────
export function useTests() {
  return useApi(() => testService.getAllTests());
}

export function useTest(id) {
  return useApi(() => testService.getTestById(id), [id]);
}

export function useCreateTest() {
  const [loading, setLoading] = useState(false);
  const createTest = async (teacherId, testData) => {
    setLoading(true);
    try {
      return await testService.createTest(teacherId, testData);
    } finally {
      setLoading(false);
    }
  };
  return { createTest, loading };
}

export function useFetchTests() {
  return useApi(() => testService.getAllTests());
}

// ─── Code Execution Hooks ─────────────────────────────
export function useRunCode() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runCode = async (questionId, language, code) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await executionService.runCode(questionId, language, code);
      setResult(res);
      return res;
    } finally {
      setLoading(false);
    }
  };
  return { runCode, result, loading };
}

// ─── Submission Hooks ─────────────────────────────────
export function useSubmitCode() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submitCode = async (payload) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await submissionService.submitCode(payload);
      setResult(res);
      return res;
    } finally {
      setLoading(false);
    }
  };
  return { submitCode, result, loading };
}

// ─── Result Hooks ─────────────────────────────────────
export function useTestResults(testId) {
  return useApi(() => resultService.getTestResults(testId), [testId]);
}
