import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [testResult, setTestResult] = useState(null);

  const endMs = test?.endTime ? new Date(test.endTime).getTime() : null;
  const countdown = useCountdown(endMs);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    
    // Warn before refresh/exit
    const handleBeforeUnload = (e) => {
      if (!submitted && isAttemptInProgress) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [submitted, isAttemptInProgress]);

  useEffect(() => {
    // Restore from session storage
    const savedCode = sessionStorage.getItem(`test_code_${id}`);
    if (savedCode) {
      setCodeMap(JSON.parse(savedCode));
    }
    const savedIdx = sessionStorage.getItem(`test_idx_${id}`);
    if (savedIdx) {
      setActiveIdx(parseInt(savedIdx));
    }

    studentService
      .startAttempt(id)
      .then((attempt) => {
        setIsAttemptInProgress(true);
      })
      .catch((err) => {
        if (err.response?.status === 403 || err.response?.status === 400) {
          setSubmitted(true);
          toast.error("Test ALREADY submitted and evaluated!");
          // Clear storage on mount if already submitted
          sessionStorage.removeItem(`test_code_${id}`);
          sessionStorage.removeItem(`test_idx_${id}`);
        }
      });

    studentService
      .getTest(id)
      .then(setTest)
      .catch(() => toast.error("Test not found"));
    studentService.getTestQuestions(id).then(setQuestions).catch(console.error);
  }, [id]);

  // Persist code changes to sessionStorage
  useEffect(() => {
    if (Object.keys(codeMap).length > 0) {
      sessionStorage.setItem(`test_code_${id}`, JSON.stringify(codeMap));
    }
  }, [codeMap, id]);

  // Persist active index to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`test_idx_${id}`, activeIdx.toString());
  }, [activeIdx, id]);

  useEffect(() => {
    if (countdown === "0m 00s" && !submitted && questions.length > 0) {
      toast("⏰ Time is up! Auto-submitting Test...", { icon: "⏰" });
      handleFinishTest();
    }
  }, [countdown]);

  const activeQuestion = questions[activeIdx];
  const activeCode = activeQuestion ? codeMap[activeQuestion.id] || "" : "";

  // Track if current question has already been evaluated
  const currentResult = activeQuestion
    ? resultsByQuestion[activeQuestion.id]
    : null;

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
      setResultsByQuestion((prev) => ({
        ...prev,
        [activeQuestion.id]: res,
      }));
      toast.success(
        `Question Submitted! Score: ${res.score?.toFixed(1)} / ${activeQuestion.marks}`,
      );
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 403) {
        toast.error(
          err.response.data.error || "Cannot submit question right now.",
        );
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishTest = async () => {
    if (submitted || submitting) return;

    const confirm = window.confirm(
      "Are you sure you want to finish the test? You will not be able to modify your answers.",
    );
    if (!confirm) return;

    setSubmitting(true);
    try {
      const result = await studentService.submitAttempt(id);
      setTestResult(result);
      setSubmitted(true);
      // Clear persistence on successful submission
      sessionStorage.removeItem(`test_code_${id}`);
      sessionStorage.removeItem(`test_idx_${id}`);
      toast.success("Test completely finished and evaluated!");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to finish test properly.",
      );
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
    const totalPossibleMarks = questions.reduce(
      (sum, q) => sum + (q.marks || 0),
      0,
    );

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "var(--bg-gradient)" }}
      >
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="glass-card max-w-lg w-full p-8 md:p-10 text-center relative z-10 border border-slate-700/50 shadow-2xl transform transition-all animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div
              className={`absolute inset-0 ${testResult?.status === "Passed" ? "bg-emerald-500/20" : "bg-blue-500/20"} rounded-full animate-ping opacity-75`}
              style={{ animationDuration: "3s" }}
            ></div>
            <div className="relative w-full h-full bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {testResult?.status === "Passed" ? (
                <CheckCircle2 size={48} className="text-emerald-400" />
              ) : (
                <Send size={48} className="text-blue-400" />
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Test Submitted</h1>
          <p className="text-emerald-400 font-medium mb-8 text-sm uppercase tracking-wider">
            {test.name}
          </p>

          {testResult && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
                  Final Score
                </p>
                <p className="text-2xl font-bold text-white">
                  {testResult.totalScore}{" "}
                  <span className="text-sm text-slate-500 font-normal">
                    / {totalPossibleMarks}
                  </span>
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
                  Accuracy
                </p>
                <p className="text-2xl font-bold text-white">
                  {testResult.overallAccuracy?.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {testResult
              ? `Congratulations! You've successfully completed the assessment. Your details and scores have been recorded safely.`
              : `Your assessment has been successfully recorded. The results have been saved safely to the server. You can now leave this page.`}
          </p>

          <div className="space-y-4 pt-2">
            <button
              onClick={() => navigate("/student")}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Return to Dashboard</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderProblemPanel = () => (
    <div className="flex flex-col h-full bg-slate-900/40">
      <div className="panel-header">
        <h3 className="panel-title">
          <FileText size={14} /> Problem Description
        </h3>
        {activeQuestion && (
          <span className="text-xs font-medium text-slate-500">
            {activeQuestion.marks} marks
          </span>
        )}
      </div>

      <div className="panel-content-scroll space-y-6">
        {/* Question Nav */}
        {questions.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`w-9 h-9 rounded-lg font-medium text-sm transition-all flex flex-col items-center justify-center ${i === activeIdx ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}
              >
                <span>{i + 1}</span>
                {resultsByQuestion[q.id] && (
                  <div className="w-1 h-1 bg-emerald-400 rounded-full mt-0.5"></div>
                )}
              </button>
            ))}
          </div>
        )}

        {activeQuestion ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeQuestion.title}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    activeQuestion.difficulty === "EASY"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : activeQuestion.difficulty === "HARD"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {activeQuestion.difficulty}
                </span>
              </div>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                {activeQuestion.description}
              </div>
            </div>

            <div className="grid gap-6">
              {activeQuestion.inputFormat && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Input Format
                  </h3>
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 text-slate-300 text-sm leading-relaxed">
                    {activeQuestion.inputFormat}
                  </div>
                </div>
              )}
              {activeQuestion.outputFormat && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Output Format
                  </h3>
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 text-slate-300 text-sm leading-relaxed">
                    {activeQuestion.outputFormat}
                  </div>
                </div>
              )}
              {activeQuestion.constraints && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Constraints
                  </h3>
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 font-mono text-slate-300 text-sm leading-relaxed">
                    {activeQuestion.constraints}
                  </div>
                </div>
              )}
            </div>

            {/* Example Test Cases */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Examples
              </h3>
              {activeQuestion.testCases
                ?.filter((tc) => !tc.isHidden)
                .map((tc, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/30 border border-slate-800/50 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/30 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Example {i + 1}
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                          Input
                        </p>
                        <pre className="bg-slate-950/50 rounded-xl p-3 text-slate-300 text-xs font-mono overflow-x-auto border border-slate-900">
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                          Output
                        </p>
                        <pre className="bg-slate-950/50 rounded-xl p-3 text-slate-300 text-xs font-mono overflow-x-auto border border-slate-900">
                          {tc.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <div className="animate-pulse mb-4">
              <Code size={40} />
            </div>
            <p className="text-sm">Preparing problem content...</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="panel-header">
        <h3 className="panel-title">
          <Code size={14} /> Editor
        </h3>
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
          Java
        </span>
      </div>
      <div className="flex-1 min-h-0 relative">
        {activeQuestion && (
          <LiveTestEditorComponent
            key={activeQuestion.id}
            testId={id}
            questionId={activeQuestion.id}
            code={activeCode}
            onChange={(val) =>
              setCodeMap((prev) => ({ ...prev, [activeQuestion.id]: val }))
            }
            setCodeMap={setCodeMap}
            isAttemptInProgress={isAttemptInProgress}
          />
        )}
      </div>
    </div>
  );

  const renderOutput = () => (
    <div className="flex flex-col h-full bg-slate-900/60">
      <div className="panel-header">
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={running || submitting || submitted}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-all border border-slate-700/50 shadow-sm"
          >
            <Play size={12} className="text-emerald-400 fill-emerald-400/20" />
            {running ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleSubmitQuestion}
            disabled={submitting || submitted || running}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
          >
            <Send size={12} />
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
        <h3 className="panel-title flex items-center gap-2">Output Console</h3>
      </div>

      <div className="panel-content-scroll bg-slate-950/30">
        {/* Local Submission Result */}
        {currentResult && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-500/20 rounded-full">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                </div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Submitted Successfully
                </span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                Latest Result
              </span>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                  Score
                </p>
                <p className="text-lg font-bold text-white">
                  {currentResult.score?.toFixed(1)}{" "}
                  <span className="text-xs text-slate-500">
                    / {activeQuestion.marks}
                  </span>
                </p>
              </div>
              <div className="w-px h-8 bg-slate-800 self-end"></div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                  Accuracy
                </p>
                <p className="text-lg font-bold text-white">
                  {currentResult.accuracy?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Run Output */}
        {output && (
          <div className="space-y-4">
            {output.testCaseResults && (
              <div className="grid gap-2">
                {output.testCaseResults.map((tc, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl transition-all ${tc.passed ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-rose-500/5 border border-rose-500/10"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tc.passed ? (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400"
                          />
                        ) : (
                          <XCircle size={14} className="text-rose-400" />
                        )}
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${tc.passed ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          Test Case {i + 1}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black italic uppercase ${tc.passed ? "text-emerald-500/50" : "text-rose-500/50"}`}
                      >
                        {tc.passed ? "Accepted" : "Wrong Answer"}
                      </span>
                    </div>
                    {!tc.passed && tc.actualOutput && (
                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                            Actual Output
                          </p>
                          <pre className="text-xs text-rose-300 font-mono whitespace-pre-wrap bg-slate-900/50 p-2 rounded-lg border border-rose-500/10">
                            {tc.actualOutput}
                          </pre>
                        </div>
                      </div>
                    )}
                    {tc.error && (
                      <div className="mt-3">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                          Error Trace
                        </p>
                        <pre className="text-xs text-rose-400 font-mono whitespace-pre-wrap bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                          {tc.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(output.output || output.error) && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Console Logs
                </h3>
                {output.output && (
                  <pre className="text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono whitespace-pre-wrap">
                    {output.output}
                  </pre>
                )}
                {output.error && (
                  <pre className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 font-mono whitespace-pre-wrap">
                    {output.error}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {!output && !currentResult && (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <div className="bg-slate-800 p-4 rounded-3xl mb-4">
              <Play size={24} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 text-center max-w-[200px] leading-relaxed">
              No output detected. Run your code to see the test case results
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950 font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="h-16 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-xl px-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
            <Code className="text-white" size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-white text-lg truncate leading-tight">
              {test.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <FileText size={10} /> {questions.length} problems
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Live Session
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 flex-shrink-0">
          {countdown && (
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all ${parseInt(countdown) < 5 && countdown.includes("m") ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse" : "bg-slate-800 border-slate-700 text-slate-300 shadow-sm"}`}
            >
              <Clock
                size={16}
                className={
                  parseInt(countdown) < 5 && countdown.includes("m")
                    ? "text-rose-500"
                    : "text-purple-400"
                }
              />
              <div className="flex flex-col -space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">
                  Time Remaining
                </span>
                <span className="font-mono text-base font-black tracking-tight leading-none">
                  {countdown}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleFinishTest}
            disabled={submitting || submitted}
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-500/20 overflow-hidden disabled:opacity-50 disabled:scale-100"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            {submitted ? (
              <CheckCircle2 size={16} />
            ) : (
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            )}
            <span>
              {submitted
                ? "Finished"
                : submitting
                  ? "Processing..."
                  : "Finish Test"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile tab switcher */}
      {isMobile && (
        <div className="livetest-tabs bg-slate-900/50">
          <button
            className={`livetest-tab ${mobileTab === "problem" ? "active" : ""}`}
            onClick={() => setMobileTab("problem")}
          >
            <FileText size={14} className="inline mr-2" />
            Problem
          </button>
          <button
            className={`livetest-tab ${mobileTab === "editor" ? "active" : ""}`}
            onClick={() => setMobileTab("editor")}
          >
            <Code size={14} className="inline mr-2" />
            Editor
          </button>
        </div>
      )}

      <div className="livetest-body flex-1 overflow-hidden relative">
        {isMobile ? (
          <div className="w-full h-full flex flex-col">
            {/* Mobile View */}
            <div
              className={`flex-1 overflow-hidden ${mobileTab !== "problem" ? "hidden" : "flex"}`}
            >
              {renderProblemPanel()}
            </div>

            <div
              className={`flex-1 flex flex-col overflow-hidden ${mobileTab !== "editor" ? "hidden" : "flex"}`}
            >
              <div className="flex-1 overflow-hidden">{renderEditor()}</div>
              <div className="h-1/2 border-t border-slate-800/60 overflow-hidden bg-slate-950">
                {renderOutput()}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop View: Resizable Panels */
          <PanelGroup direction="horizontal" className="w-full h-full">
            {/* LEFT SIDE — PROBLEM */}
            <Panel
              defaultSize={45}
              minSize={30}
              className="bg-slate-900 overflow-y-auto"
            >
              <div className="p-5 h-full">{renderProblemPanel()}</div>
            </Panel>

            <PanelResizeHandle className="w-[2px] bg-slate-700 hover:bg-purple-500 cursor-col-resize" />

            {/* RIGHT SIDE — EDITOR */}
            <Panel defaultSize={55} minSize={40}>
              <div className="flex flex-col h-full">
                {/* CODE EDITOR */}
                <div className="flex-1 border-b border-slate-700">
                  {renderEditor()}
                </div>

                {/* RUN / SUBMIT / OUTPUT */}
                <div className="h-[220px] bg-slate-900 p-4 overflow-y-auto">
                  {renderOutput()}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}
