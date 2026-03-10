import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentService } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import LiveTestEditorComponent from "./LiveTestEditorComponent";
import toast from "react-hot-toast";
import {
  Play,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Code,
  ArrowRight,
} from "lucide-react";

const DEFAULT_CODE = `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution here\n        \n    }\n}`;

function useCountdown(endMs) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!endMs) return;
    const tick = () => setRemaining(Math.max(0, endMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endMs]);
  if (remaining === null) return "";
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${h > 0 ? `${h}h ` : ""}${m}m ${String(s).padStart(2, "0")}s`;
}

export function LiveTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [codeMap, setCodeMap] = useState({});
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAttemptInProgress, setIsAttemptInProgress] = useState(false);
  // Store results per question ID instead of statically
  const [resultsByQuestion, setResultsByQuestion] = useState({});
  // Mobile tab: 'problem' | 'editor'
  const [mobileTab, setMobileTab] = useState("problem");

  const endMs = test?.endTime ? new Date(test.endTime).getTime() : null;
  const countdown = useCountdown(endMs);

  useEffect(() => {
    studentService.startAttempt(id)
      .then((attempt) => {
          setIsAttemptInProgress(true);
      })
      .catch((err) => {
          if (err.response?.status === 403 || err.response?.status === 400) {
              setSubmitted(true);
              toast.error("Test ALREADY submitted and evaluated!");
          }
      });

    studentService
      .getTest(id)
      .then(setTest)
      .catch(() => toast.error("Test not found"));
    studentService.getTestQuestions(id).then(setQuestions).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (countdown === "0m 00s" && !submitted && questions.length > 0) {
      toast("⏰ Time is up! Auto-submitting Test...", { icon: "⏰" });
      handleFinishTest();
    }
  }, [countdown]);
  
  const activeQuestion = questions[activeIdx];
  const activeCode = activeQuestion ? (codeMap[activeQuestion.id] || "") : "";
  
  // Track if current question has already been evaluated
  const currentResult = activeQuestion ? resultsByQuestion[activeQuestion.id] : null;

  const handleRun = async () => {
    if (!activeQuestion) return;
    setRunning(true);
    setOutput(null);
    // Switch to editor tab on mobile so user can see output
    setMobileTab("editor");
    try {
      const sampleTestCases =
        activeQuestion.testCases
          ?.filter((tc) => !tc.isHidden)
          .map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })) || [];

      const res = await studentService.runCode({
        code: activeCode,
        language: "java",
        sampleTestCases:
          sampleTestCases.length > 0 ? sampleTestCases : undefined,
        input: sampleTestCases.length === 0 ? "" : undefined,
      });
      setOutput(res);
    } catch (err) {
      toast.error("Execution failed. Check your code.");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!activeQuestion || submitted) return;
    setSubmitting(true);
    try {
      const res = await studentService.submitCode({
        questionId: activeQuestion.id,
        testId: id,
        code: activeCode,
        language: "java",
      });
      setResultsByQuestion(prev => ({
          ...prev,
          [activeQuestion.id]: res
      }));
      toast.success(
        `Question Submitted! Score: ${res.score?.toFixed(1)} / ${activeQuestion.marks}`,
      );
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 403) {
          toast.error(err.response.data.error || "Cannot submit question right now.");
      } else {
          toast.error("Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishTest = async () => {
    if (submitted) return;
    
    const confirm = window.confirm("Are you sure you want to finish the test? You will not be able to modify your answers.");
    if (!confirm) return;
    
    setSubmitting(true);
    try {
      await studentService.submitAttempt(id);
      setSubmitted(true);
      toast.success("Test completely finished and evaluated!");
    } catch (err) {
      toast.error("Failed to finish test properly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!test)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-gradient)" }}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg-gradient)" }}>
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="glass-card max-w-md w-full p-8 md:p-10 text-center relative z-10 border border-slate-700/50 shadow-2xl transform transition-all animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
            <div className="relative w-full h-full bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">Test Submitted</h1>
          <p className="text-emerald-400 font-medium mb-4 text-sm uppercase tracking-wider">{test.name}</p>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Your assessment has been successfully recorded. The results have been saved safely to the server. You can now leave this page.
          </p>
          
          <div className="space-y-4 pt-2">
            <button
              onClick={() => navigate('/student')}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-gradient)" }}
    >
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="font-bold text-white text-base sm:text-lg truncate">
            {test.name}
          </h1>
          <p className="text-slate-400 text-xs">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {countdown && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm ${parseInt(countdown) < 5 ? "bg-red-500/20 text-red-400" : "bg-slate-700/50 text-slate-300"}`}
            >
              <Clock size={13} />
              <span className="font-mono font-semibold whitespace-nowrap">
                {countdown}
              </span>
            </div>
          )}
          <button
            onClick={handleFinishTest}
            disabled={submitting || submitted}
            className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:px-4 bg-red-600 hover:bg-red-500"
          >
            <CheckCircle2 size={13} />
            <span className="hidden xs:inline sm:inline">
              {submitted
                ? "Finished"
                : submitting
                  ? "Finishing..."
                  : "Finish Test"}
            </span>
            <span className="xs:hidden sm:hidden">
              {submitted ? "✓" : submitting ? "..." : "Fin"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="livetest-tabs">
        <button
          className={`livetest-tab ${mobileTab === "problem" ? "active" : ""}`}
          onClick={() => setMobileTab("problem")}
        >
          <FileText size={14} style={{ display: "inline", marginRight: 6 }} />
          Problem
        </button>
        <button
          className={`livetest-tab ${mobileTab === "editor" ? "active" : ""}`}
          onClick={() => setMobileTab("editor")}
        >
          <Code size={14} style={{ display: "inline", marginRight: 6 }} />
          Editor
        </button>
      </div>

      <div className="livetest-body flex-1">
        {/* Problem Panel */}
        <div
          className={`livetest-problem-panel space-y-4 ${mobileTab !== "problem" ? "livetest-panel-hidden" : ""}`}
        >
          {/* Question Nav */}
          {questions.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-9 h-9 rounded-lg font-medium text-sm transition-all flex flex-col items-center justify-center ${i === activeIdx ? "bg-purple-600 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"}`}
                >
                  <span>{i + 1}</span>
                  {resultsByQuestion[q.id] && (
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-0.5"></div>
                  )}
                </button>
              ))}
            </div>
          )}

          {activeQuestion ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">
                  {activeQuestion.title}
                </h2>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    activeQuestion.difficulty === "EASY"
                      ? "bg-green-500/20 text-green-400"
                      : activeQuestion.difficulty === "HARD"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {activeQuestion.difficulty}
                </span>
                <span className="ml-auto text-sm text-slate-400">
                  {activeQuestion.marks} marks
                </span>
              </div>

              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                {activeQuestion.description}
              </div>

              {activeQuestion.inputFormat && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">
                    Input Format
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {activeQuestion.inputFormat}
                  </p>
                </div>
              )}
              {activeQuestion.outputFormat && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">
                    Output Format
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {activeQuestion.outputFormat}
                  </p>
                </div>
              )}
              {activeQuestion.constraints && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">
                    Constraints
                  </h3>
                  <p className="text-slate-400 text-sm font-mono">
                    {activeQuestion.constraints}
                  </p>
                </div>
              )}

              {/* Sample Test Cases */}
              {activeQuestion.testCases
                ?.filter((tc) => !tc.isHidden)
                .map((tc, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/60 rounded-xl p-4 space-y-2"
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Example {i + 1}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Input</p>
                        <pre className="bg-slate-900/80 rounded-lg p-2 text-slate-300 text-xs font-mono overflow-x-auto">
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Output</p>
                        <pre className="bg-slate-900/80 rounded-lg p-2 text-slate-300 text-xs font-mono overflow-x-auto">
                          {tc.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Loading questions...
            </div>
          )}
        </div>

        {/* Editor + Output Panel */}
        <div
          className={`livetest-editor-panel ${mobileTab !== "editor" ? "livetest-panel-hidden" : ""}`}
        >
          <div className="flex-1" style={{ minHeight: 0, flex: 1 }}>
            {activeQuestion && (
              <LiveTestEditorComponent
                key={activeQuestion.id}
                testId={id}
                questionId={activeQuestion.id}
                code={activeCode}
                onChange={(val) => setCodeMap((prev) => ({ ...prev, [activeQuestion.id]: val }))}
                setCodeMap={setCodeMap}
                isAttemptInProgress={isAttemptInProgress}
              />
            )}
          </div>

          {/* Output Panel */}
          <div className="border-t border-slate-700/50 bg-slate-900/90 p-4 max-h-[220px] overflow-y-auto flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">Output</h3>
              <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    disabled={running || submitting || submitted}
                    className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors border border-slate-600"
                  >
                    <Play size={14} className="text-emerald-400" />
                    {running ? "Running..." : "Run Code"}
                  </button>
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={submitting || submitted || running}
                    className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Send size={14} />
                    {submitting ? "Submitting..." : "Submit Question"}
                  </button>
              </div>
            </div>

            {/* Local Submission Result */}
            {currentResult && (
              <div className="mb-3 p-3 rounded-lg bg-slate-800/80 space-y-1 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span className="text-white font-semibold">
                      Question Evaluated
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                      Saved safely to server
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  Score:{" "}
                  <span className="text-green-400 font-bold">
                    {currentResult.score?.toFixed(1)}
                  </span>{" "}
                  · Accuracy:{" "}
                  <span className="text-blue-400 font-bold">
                    {currentResult.accuracy?.toFixed(1)}%
                  </span>
                </p>
              </div>
            )}

            {/* Run Output */}
            {output && (
              <div className="space-y-2">
                {output.testCaseResults?.map((tc, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg text-sm ${tc.passed ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
                  >
                    <div className="flex items-center gap-2">
                      {tc.passed ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                      <span
                        className={
                          tc.passed ? "text-green-400" : "text-red-400"
                        }
                      >
                        Sample {i + 1}: {tc.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                    {!tc.passed && tc.actualOutput && (
                      <pre className="mt-1 text-xs text-slate-400 font-mono">
                        Got: {tc.actualOutput}
                      </pre>
                    )}
                    {tc.error && (
                      <pre className="mt-1 text-xs text-red-400 font-mono">
                        {tc.error}
                      </pre>
                    )}
                  </div>
                ))}
                {output.output && (
                  <pre className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-2 font-mono">
                    {output.output}
                  </pre>
                )}
                {output.error && (
                  <pre className="text-sm text-red-400 bg-red-500/10 rounded-lg p-2 font-mono">
                    {output.error}
                  </pre>
                )}
              </div>
            )}

            {!output && !currentResult && (
              <p className="text-slate-500 text-sm">
                Click "Run Code" to test against sample cases, or "Submit Question" to lock in your score for this logic.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
