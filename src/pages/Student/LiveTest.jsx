import { useEffect, useState } from "react";
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
  FileText,
  Code2,
  ArrowRight,
  Monitor,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

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
  const [resultsByQuestion, setResultsByQuestion] = useState({});
  const [mobileTab, setMobileTab] = useState("problem");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [testResult, setTestResult] = useState(null);

  const endMs = test?.endTime ? new Date(test.endTime).getTime() : null;
  const countdown = useCountdown(endMs);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
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
    const savedCode = sessionStorage.getItem(`test_code_${id}`);
    if (savedCode) setCodeMap(JSON.parse(savedCode));
    const savedIdx = sessionStorage.getItem(`test_idx_${id}`);
    if (savedIdx) setActiveIdx(parseInt(savedIdx));

    studentService.startAttempt(id)
      .then(() => setIsAttemptInProgress(true))
      .catch((err) => {
        if (err.response?.status === 403 || err.response?.status === 400) {
          setSubmitted(true);
          toast.error("Evaluation already submitted.");
        }
      });

    studentService.getTest(id).then(setTest).catch(() => toast.error("Test not found"));
    studentService.getTestQuestions(id).then(setQuestions).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (Object.keys(codeMap).length > 0) sessionStorage.setItem(`test_code_${id}`, JSON.stringify(codeMap));
  }, [codeMap, id]);

  useEffect(() => {
    sessionStorage.setItem(`test_idx_${id}`, activeIdx.toString());
  }, [activeIdx, id]);

  useEffect(() => {
    if (countdown === "0m 00s" && !submitted && questions.length > 0) {
      toast("⏰ Time's up! Auto-submitting...", { icon: "⏰" });
      handleFinishTest();
    }
  }, [countdown]);

  const activeQuestion = questions[activeIdx];
  const activeCode = activeQuestion ? codeMap[activeQuestion.id] || "" : "";
  const currentResult = activeQuestion ? resultsByQuestion[activeQuestion.id] : null;

  const handleRun = async () => {
    if (!activeQuestion) return;
    setRunning(true);
    setOutput(null);
    setMobileTab("editor");
    try {
      const sampleTestCases = activeQuestion.testCases
          ?.filter((tc) => !tc.isHidden)
          .map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput })) || [];

      const res = await studentService.runCode({
        code: activeCode,
        language: "java",
        questionId: activeQuestion.id,
        sampleTestCases: sampleTestCases.length > 0 ? sampleTestCases : undefined,
      });
      setOutput(res);
    } catch (err) {
      toast.error("Execution failed.");
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
      setResultsByQuestion((prev) => ({ ...prev, [activeQuestion.id]: res }));
      toast.success(`Submission stored. Score: ${res.score?.toFixed(1)}`);
    } catch (err) {
      toast.error("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishTest = async () => {
    if (submitted || submitting) return;
    if (!window.confirm("Complete the assessment? All answers will be finalized.")) return;
    setSubmitting(true);
    try {
      const result = await studentService.submitAttempt(id);
      setTestResult(result);
      setSubmitted(true);
      sessionStorage.removeItem(`test_code_${id}`);
      sessionStorage.removeItem(`test_idx_${id}`);
      toast.success("Assessment Complete.");
    } catch (err) {
      toast.error("Submission failed.");
      setSubmitting(false);
    }
  };

  if (!test) return (
     <div className="h-screen flex items-center justify-center bg-white animate-pulse">
        <div className="w-10 h-10 rounded-full border-4 border-gray-100 border-t-black animate-spin"></div>
     </div>
  );

  if (submitted) {
    const totalPossibleMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    return (
      <div className="h-screen bg-[#f9fafb] flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="bg-white border border-gray-100 rounded-[40px] shadow-2xl p-12 max-w-xl w-full text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 text-black">
              <Trophy size={200} />
           </div>
           
           <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-[#2df07b] text-zinc-900 flex items-center justify-center shadow-lg shadow-[#2df07b]/20">
                 <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              
              <div className="space-y-2">
                 <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Assessment Success</h1>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{test.name}</p>
              </div>

              {testResult && (
                <div className="grid grid-cols-2 gap-6 w-full py-6 border-y border-gray-50">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Yield</p>
                    <p className="text-2xl font-black text-gray-900 font-mono">
                      {testResult.totalScore} <span className="text-gray-300 text-xs lowercase">pts</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Precision</p>
                    <p className="text-2xl font-black text-gray-900 font-mono">{testResult.overallAccuracy?.toFixed(1)}%</p>
                  </div>
                </div>
              )}

              <p className="text-gray-500 text-sm font-medium px-4">
                Your performance metrics have been recorded in the permanent ledger. Contact your instructor for further evaluation.
              </p>

              <button
                onClick={() => navigate("/student")}
                className="w-full bg-black hover:bg-zinc-800 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                Return to Hub <ArrowRight size={20} />
              </button>
           </div>
        </div>
      </div>
    );
  }

  const renderProblemPanel = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-4">
           <span className="w-7 h-7 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-[11px] font-black">{activeIdx + 1}</span>
           <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Problem Specification</h3>
        </div>
        <div className="flex items-center gap-4">
           {resultsByQuestion[activeQuestion?.id] && (
             <span className="flex items-center gap-1.5 text-[#2df07b] text-[10px] font-black uppercase tracking-widest">
               <Zap size={14} fill="#2df07b" /> Evaluated
             </span>
           )}
           <span className="bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">
             {activeQuestion?.marks} Weight
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6">
           <div className="flex gap-2">
             {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-9 h-9 rounded-xl font-black text-xs transition-all border flex items-center justify-center ${i === activeIdx ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                >
                  {i + 1}
                </button>
             ))}
           </div>
           <div className="flex items-center gap-2">
             <button onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))} className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:text-black shadow-sm disabled:opacity-20" disabled={activeIdx === 0}>
                <ChevronLeft size={18} />
             </button>
             <button onClick={() => setActiveIdx(Math.min(questions.length - 1, activeIdx + 1))} className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:text-black shadow-sm disabled:opacity-20" disabled={activeIdx === questions.length - 1}>
                <ChevronRight size={18} />
             </button>
           </div>
        </div>

        {activeQuestion && (
          <div className="animate-fade-in space-y-10">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{activeQuestion.title}</h2>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${activeQuestion.difficulty === 'EASY' ? 'bg-green-50 text-green-600 border-green-100' : activeQuestion.difficulty === 'HARD' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                    {activeQuestion.difficulty}
                  </span>
               </div>
               <p className="text-gray-500 text-[14px] leading-relaxed font-medium whitespace-pre-wrap">{activeQuestion.description}</p>
            </div>

            <div className="grid gap-10 border-t border-gray-50 pt-10">
               {activeQuestion.inputFormat && (
                 <div className="space-y-3">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Standard Input Format</h3>
                   <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-gray-600 text-sm font-medium leading-relaxed">
                     {activeQuestion.inputFormat}
                   </div>
                 </div>
               )}
               {activeQuestion.constraints && (
                 <div className="space-y-3">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Domain Constraints</h3>
                   <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 font-mono text-gray-900 text-[13px] font-bold">
                     {activeQuestion.constraints}
                   </div>
                 </div>
               )}
            </div>

            <div className="space-y-6 pt-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Example Interactions</h3>
              {activeQuestion.testCases?.filter((tc) => !tc.isHidden).map((tc, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-sm">
                  <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Sample Vector {i + 1}</span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Input Stream</p>
                       <pre className="bg-white border border-gray-100 rounded-xl p-4 text-gray-900 text-[12px] font-mono shadow-inner italic">{tc.input || 'None'}</pre>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Expected Yield</p>
                       <pre className="bg-white border border-gray-100 rounded-xl p-4 text-gray-900 text-[12px] font-mono shadow-inner font-bold">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditorArea = () => (
    <div className="h-full flex flex-col bg-[#09090b]">
       <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-black">
          <div className="flex items-center gap-3">
             <div className="p-1 px-1.5 rounded bg-zinc-800 text-[#2df07b] shadow shadow-black">
                <Code2 size={16} strokeWidth={2.5} />
             </div>
             <h3 className="text-[10px] font-black text-white px-2 py-0.5 rounded bg-zinc-900 uppercase tracking-widest border border-white/5">Java Environment</h3>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2df07b] animate-pulse"></span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Syncing to Cloud</span>
             </div>
          </div>
       </div>
       <div className="flex-1 min-h-0 relative">
          <LiveTestEditorComponent
            key={activeQuestion?.id}
            testId={id}
            questionId={activeQuestion?.id}
            code={activeCode}
            onChange={(val) => setCodeMap((prev) => ({ ...prev, [activeQuestion?.id]: val }))}
            setCodeMap={setCodeMap}
            isAttemptInProgress={isAttemptInProgress}
          />
       </div>
    </div>
  );

  const renderConsole = () => (
    <div className="h-full flex flex-col bg-[#09090b] border-t border-white/5">
       <div className="h-12 px-6 border-b border-white/5 bg-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
             <button
               onClick={handleRun}
               disabled={running || submitting || submitted}
               className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2df07b] hover:text-white transition-colors disabled:opacity-20"
             >
               <Play size={14} fill="currentColor" /> {running ? "Simulating..." : "Run Selection"}
             </button>
             <button
               onClick={handleSubmitQuestion}
               disabled={submitting || submitted || running}
               className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-[#2df07b] transition-colors disabled:opacity-20"
             >
               <Send size={14} /> {submitting ? "Deploying..." : "Submit Vector"}
             </button>
          </div>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Execution Terminal</p>
       </div>

       <div className="flex-1 overflow-y-auto p-6 bg-black/40 custom-scrollbar font-mono text-[13px]">
          {currentResult && (
            <div className="mb-8 p-5 bg-[#2df07b]/5 border border-[#2df07b]/20 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#2df07b] text-black flex items-center justify-center">
                     <CheckCircle2 size={16} strokeWidth={3} />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-[#2df07b] uppercase tracking-widest">Evaluation Recorded</p>
                     <p className="text-white font-bold">Latest Score: {currentResult.score?.toFixed(1)} / {activeQuestion?.marks}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Precision Hub</p>
                  <p className="text-xl font-black text-white leading-none">{currentResult.accuracy?.toFixed(1)}%</p>
               </div>
            </div>
          )}

          {output && (
            <div className="space-y-6">
               {output.testCaseResults && (
                 <div className="space-y-2">
                    {output.testCaseResults.map((tc, i) => (
                      <div key={i} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${tc.passed ? "bg-green-500/5 border-green-500/10 text-green-400" : "bg-red-500/5 border-red-500/10 text-red-400"}`}>
                         <div className="flex items-center gap-3">
                           {tc.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                           <span className="text-[11px] font-black uppercase tracking-widest">Test Case {i + 1}</span>
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{tc.passed ? "Valid" : "Deviation"}</span>
                      </div>
                    ))}
                 </div>
               )}
               {(output.output || output.error) && (
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">System Out Stream</p>
                    <pre className={`p-4 rounded-2xl border bg-black text-xs leading-relaxed whitespace-pre-wrap ${output.error ? 'border-red-900/30 text-red-500' : 'border-white/5 text-gray-400'}`}>
                      {output.error || output.output}
                    </pre>
                 </div>
               )}
            </div>
          )}

          {!output && !currentResult && (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
               <Monitor size={48} className="text-gray-400" />
               <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Listening for Input...</p>
            </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white text-gray-900 font-sans selection:bg-[#2df07b] selection:text-black">
      {/* Dynamic Header */}
      <header className="h-16 border-b border-gray-100 bg-white px-8 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-5">
           <div className="p-2 border border-gray-100 rounded-lg shadow-sm text-gray-400">
             <Trophy size={20} />
           </div>
           <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none uppercase">{test.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                 <span className="text-[10px] font-black text-[#2df07b] bg-zinc-900 px-2 py-0.5 rounded uppercase tracking-widest">Active Attempt</span>
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{questions.length} Items Locked</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8">
           {countdown && (
             <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl shadow-sm border transition-all ${countdown.includes("s") && !countdown.includes("m") && !countdown.includes("h") ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-100 text-gray-900'}`}>
                <Clock size={16} className={countdown.includes("s") && !countdown.includes("m") ? 'text-red-500' : 'text-zinc-600'} />
                <div className="flex flex-col -space-y-0.5">
                   <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 leading-none">Termination In</span>
                   <span className="font-mono text-lg font-black tracking-tight leading-none">{countdown}</span>
                </div>
             </div>
           )}

           <button
             onClick={handleFinishTest}
             disabled={submitting || submitted}
             className="bg-black hover:bg-zinc-800 text-white font-black py-3 px-8 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest text-xs"
           >
             Initialize Finalization <ArrowRight size={18} />
           </button>
        </div>
      </header>

      {/* Mobile Interaction Hub */}
      {isMobile && (
        <div className="h-14 bg-gray-50 border-b border-gray-100 flex p-1.5 gap-1.5 shrink-0">
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mobileTab === "problem" ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
            onClick={() => setMobileTab("problem")}
          >
            <FileText size={14} /> Problem
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mobileTab === "editor" ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
            onClick={() => setMobileTab("editor")}
          >
            <Code2 size={14} /> Workspace
          </button>
        </div>
      )}

      {/* Execution Environment */}
      <div className="flex-1 overflow-hidden relative">
        {isMobile ? (
          <div className="w-full h-full flex flex-col">
            <div className={`flex-1 overflow-hidden ${mobileTab !== "problem" ? "hidden" : "flex"}`}>{renderProblemPanel()}</div>
            <div className={`flex-1 flex flex-col overflow-hidden ${mobileTab !== "editor" ? "hidden" : "flex"}`}>
              <div className="flex-1">{renderEditorArea()}</div>
              <div className="h-1/3 min-h-[200px] border-t border-white/5">{renderConsole()}</div>
            </div>
          </div>
        ) : (
          <PanelGroup direction="horizontal" className="w-full h-full">
            <Panel defaultSize={40} minSize={30} className="bg-white">
              {renderProblemPanel()}
            </Panel>
            <PanelResizeHandle className="w-0.5 bg-gray-100 hover:bg-black transition-colors" />
            <Panel defaultSize={60} minSize={40}>
              <div className="flex flex-col h-full">
                <div className="flex-1">{renderEditorArea()}</div>
                <div className="h-[280px]">{renderConsole()}</div>
              </div>
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}
