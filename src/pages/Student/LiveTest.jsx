import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CodeEditor } from "../../components/editor/CodeEditor";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Clock, LayoutTemplate, Bug, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_QUESTION = {
  title: "Two Sum",
  difficulty: "Easy",
  marks: 10,
  description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
  inputFormat: "The first line contains an integer n (size of array).\nThe second line contains n space-separated integers.\nThe third line contains an integer target.",
  outputFormat: "Print two space-separated integers representing the indices.",
  constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
};

export const LiveTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleRun = (code, language) => {
    toast.error("Running code...");
    setConsoleOutput([{ type: "info", text: `Compiling ${language}...` }]);
    
    // Mock API run
    setTimeout(() => {
      setConsoleOutput([
        { type: "info", text: "Compilation successful." },
        { type: "success", text: "Test Case 1: Passed (12ms)" },
        { type: "success", text: "Test Case 2: Passed (15ms)" },
        { type: "error", text: "Test Case 3: Failed. Expected Output: [1, 2], Got: [0, 1]" }
      ]);
      toast.success("Execution completed");
    }, 1500);
  };

  const handleSubmit = (code, language) => {
    setConsoleOutput([{ type: "info", text: "Evaluating all test cases..." }]);
    
    // Mock submit process
    setTimeout(() => {
      setSubmissionResult({
        passed: 4,
        total: 5,
        score: 8,
        marks: 10
      });
      setShowSubmitModal(true);
      setConsoleOutput([
        { type: "success", text: "Passed 4/5 test cases." },
        { type: "info", text: "Score: 8/10" }
      ]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] dark:bg-[#0f0f11] text-gray-900 dark:text-gray-100 font-sans">
      {/* Top Bar */}
      <header className="h-14 bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center space-x-2 font-bold text-lg">
          <LayoutTemplate className="text-blue-600 dark:text-blue-500" />
          <span>CodeArena <span className="text-gray-400 font-normal text-sm ml-2">| {MOCK_QUESTION.title}</span></span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className={`flex items-center font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}`}>
            <Clock size={18} className="mr-2" />
            {formatTime(timeLeft)}
          </div>
          <Button variant="danger" size="sm" onClick={() => navigate("/student")} className="px-6">
            End Test
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Question Desc */}
        <div className="w-1/3 min-w-[300px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold">{MOCK_QUESTION.title}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {MOCK_QUESTION.difficulty}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {MOCK_QUESTION.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-semibold text-sm mb-1">Input Format</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-[#0f0f11] p-3 rounded-lg border dark:border-gray-800">
                  {MOCK_QUESTION.inputFormat}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Output Format</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-[#0f0f11] p-3 rounded-lg border dark:border-gray-800">
                  {MOCK_QUESTION.outputFormat}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Constraints</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-[#0f0f11] p-3 rounded-lg border dark:border-gray-800">
                  {MOCK_QUESTION.constraints}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex-1 flex flex-col min-w-[400px]">
          {/* Editor */}
          <div className="flex-1 relative">
            <CodeEditor onRun={handleRun} onSubmit={handleSubmit} />
          </div>

          {/* Console Output */}
          <div className="h-64 border-t border-gray-800 bg-[#1e1e1e] flex flex-col">
            <div className="flex items-center px-4 py-2 border-b border-gray-800 bg-[#252526] text-xs font-semibold text-gray-400">
              <Bug size={14} className="mr-2" /> Test Results Console
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2">
              {consoleOutput.length === 0 ? (
                <div className="text-gray-500 italic">Run your code to see results...</div>
              ) : (
                consoleOutput.map((log, i) => (
                  <div key={i} className={`
                    ${log.type === "error" ? "text-red-400" : ""}
                    ${log.type === "success" ? "text-green-400" : ""}
                    ${log.type === "info" ? "text-blue-300" : ""}
                  `}>
                    &gt; {log.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Result Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submission Result">
        {submissionResult && (
          <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
            {submissionResult.passed === submissionResult.total ? (
              <CheckCircle2 size={64} className="text-green-500 mb-2" />
            ) : (
              <Bug size={64} className="text-orange-500 mb-2" />
            )}
            
            <div className="space-y-2 w-full">
              <h3 className="text-2xl font-bold">
                {submissionResult.passed === submissionResult.total ? "All Tests Passed!" : "Partial Success"}
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Test Cases Passed</div>
                  <div className="text-2xl font-bold">{submissionResult.passed} / {submissionResult.total}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Your Score</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{submissionResult.score} / {submissionResult.marks}</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 w-full pt-4">
              <Button onClick={() => setShowSubmitModal(false)} variant="outline" className="flex-1">
                Close & Keep Editing
              </Button>
              <Button onClick={() => navigate("/student")} className="flex-1">
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
