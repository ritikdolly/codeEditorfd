import { useEffect, useState, useCallback, useRef } from "react";
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
  RotateCcw,
} from "lucide-react";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const DEFAULT_CODE = `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution here\n        \n    }\n}`;

function useCountdown(endMs, serverOffset = 0) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!endMs) return;
    const tick = () => setRemaining(Math.max(0, endMs - (Date.now() + serverOffset)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endMs, serverOffset]);
  
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
  const [outputsByQuestion, setOutputsByQuestion] = useState({});
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAttemptInProgress, setIsAttemptInProgress] = useState(false);
  const [resultsByQuestion, setResultsByQuestion] = useState({});
  const [mobileTab, setMobileTab] = useState("problem");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [testResult, setTestResult] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Proctoring States
  const [fullscreenViolations, setFullscreenViolations] = useState(0);
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(5);
  const [hasStartedFullscreen, setHasStartedFullscreen] = useState(false);
  const handleFinishTestRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const now = currentTime + serverOffset;
  const startMs = test?.startTime ? new Date(test.startTime).getTime() : null;
  const endMs = test?.endTime ? new Date(test.endTime).getTime() : null;

  const countdown = useCountdown(endMs, serverOffset);
  const waitCountdown = useCountdown(startMs, serverOffset);

  const isBeforeStart = startMs && now < startMs;
  const isAfterEnd = endMs && now > endMs;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    const handleBeforeUnload = (e) => {
      if (!submitted && isAttemptInProgress && !isAfterEnd) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [submitted, isAttemptInProgress, isAfterEnd]);

  useEffect(() => {
    const savedCode = sessionStorage.getItem(`test_code_${id}`);
    if (savedCode) setCodeMap(JSON.parse(savedCode));
    const savedIdx = sessionStorage.getItem(`test_idx_${id}`);
    if (savedIdx) setActiveIdx(parseInt(savedIdx));

    // Sync with server time
    studentService.getServerTime()
      .then(res => {
        const serverTime = new Date(res.serverTime).getTime();
        setServerOffset(serverTime - Date.now());
      })
      .catch(console.error);

    studentService.getTest(id).then(setTest).catch(() => toast.error("Test not found"));
  }, [id]);

  useEffect(() => {
    if (test && !isBeforeStart && questions.length === 0) {
      studentService.getTestQuestions(id)
        .then(setQuestions)
        .catch(err => {
          if (err.response?.status === 400) {
            console.log("Questions not available yet (timing guard)");
          } else {
            toast.error("Could not load questions");
          }
        });
    }
  }, [id, test, isBeforeStart, questions.length]);

  useEffect(() => {
    if (test && !isBeforeStart && !isAfterEnd && !isAttemptInProgress && !submitted && hasStartedFullscreen) {
       studentService
        .startAttempt(id)
        .then(() => setIsAttemptInProgress(true))
        .catch((err) => {
          if (err.response?.status === 403 || err.response?.status === 400) {
            setSubmitted(true);
            toast.error(err.response?.data?.error || "Test ALREADY submitted and evaluated!");
            sessionStorage.removeItem(`test_code_${id}`);
            sessionStorage.removeItem(`test_idx_${id}`);
            // Exit fullscreen if already entered but attempt was blocked
            if (document.fullscreenElement) document.exitFullscreen().catch(console.error);
          }
        });
    }
  }, [test, isBeforeStart, isAfterEnd, isAttemptInProgress, submitted, id, hasStartedFullscreen]);

  useEffect(() => {
    if (isAfterEnd && test && isAttemptInProgress && !submitted) {
      toast("⏰ Time is up! Auto-submitting Test...", { icon: "⏰" });
      handleFinishTest(true);
    }
  }, [isAfterEnd, test, isAttemptInProgress, submitted]);

  useEffect(() => {
    if (Object.keys(codeMap).length > 0) sessionStorage.setItem(`test_code_${id}`, JSON.stringify(codeMap));
  }, [codeMap, id]);

  useEffect(() => {
    sessionStorage.setItem(`test_idx_${id}`, activeIdx.toString());
  }, [activeIdx, id]);

  useEffect(() => {
    if (!test || !user || !isAttemptInProgress) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8081/ws-monitor';
    const socket = new SockJS(wsUrl);
    const client = Stomp.over(socket);
    client.debug = (str) => {}; // Re-enabling as empty function to satisfy compatibility
    client.onDebug = (str) => {}; // Version 7 uses onDebug properties in some scenarios

    const sendStatus = (status) => {
      if (client.connected) {
        client.send(`/app/test/${id}/status`, {}, JSON.stringify({
          studentId: user?.id,
          studentName: user?.name,
          testId: id,
          status: status,
          questionsSolved: Object.keys(resultsByQuestion).length,
          totalQuestions: questions.length
        }));
      }
    };

    client.connect({}, () => {
      sendStatus('RECONNECT');
    }, (error) => {
      console.log('STOMP error:', error);
    });

    return () => {
      if (client.connected) {
        sendStatus('DISCONNECT');
        client.disconnect();
      }
    };
  }, [id, user, test, isAttemptInProgress, resultsByQuestion, questions.length]);

  const activeQuestion = questions[activeIdx];
  const activeCode = activeQuestion ? codeMap[activeQuestion.id] || "" : "";
  const currentResult = activeQuestion ? resultsByQuestion[activeQuestion.id] : null;
  const currentOutput = activeQuestion ? outputsByQuestion[activeQuestion.id] : null;

  const handleRun = async () => {
    if (!activeQuestion) return;
    setRunning(true);
    setOutputsByQuestion(prev => ({ ...prev, [activeQuestion.id]: null }));
    if (isMobile) setMobileTab("editor");
    
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
      setOutputsByQuestion((prev) => ({
        ...prev,
        [activeQuestion.id]: res,
      }));
    } catch (err) {
      toast.error("Execution failed.");
    } finally {
      setRunning(false);
    }
  };

  const handleResetCode = async () => {
    if (!activeQuestion || submitted) return;
    
    let initialCode = DEFAULT_CODE;
    if (activeQuestion.templateCode) {
        initialCode = activeQuestion.templateCode;
    } else if (activeQuestion.prefixCode || activeQuestion.suffixCode) {
        initialCode = (activeQuestion.prefixCode || "") + "\n/* START_EDITABLE */\n\n/* END_EDITABLE */\n" + (activeQuestion.suffixCode || "");
    }

    setCodeMap(prev => ({ ...prev, [activeQuestion.id]: initialCode }));
    toast.success("Code reset to initial template.");
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
        [activeQuestion.id]: res.submission,
      }));

      setOutputsByQuestion((prev) => ({
        ...prev,
        [activeQuestion.id]: {
          testCaseResults: res.testCaseResults,
          status: res.submission.score > 0 ? "ALL_PASSED" : "SOME_FAILED",
          judgeReport: res.judgeReport
        },
      }));

      toast.success(
        `Question Submitted! Score: ${res.submission.score?.toFixed(1)} / ${activeQuestion.marks}`,
      );
    } catch (err) {
      toast.error("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishTest = async (autoSubmit = false) => {
    if (submitted || submitting) return;

    if (!autoSubmit) {
      const confirm = window.confirm(
        "Are you sure you want to finish the test? You will not be able to modify your answers.",
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      const result = await studentService.submitAttempt(id);
      
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8081/ws-monitor';
        const socket = new SockJS(wsUrl);
        const client = Stomp.over(socket);
        client.debug = (str) => {};
        client.onDebug = (str) => {};
        client.connect({}, () => {
          client.send(`/app/test/${id}/status`, {}, JSON.stringify({
            studentId: user?.id,
            studentName: user?.name,
            testId: id,
            status: 'SUBMIT',
            questionsSolved: questions.length,
            totalQuestions: questions.length
          }));
          setTimeout(() => client.disconnect(), 1000);
        });
      } catch(e) {}

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

  useEffect(() => {
    handleFinishTestRef.current = handleFinishTest;
  });

  // --- Proctoring Logic ---

  useEffect(() => {
    if (!test || !isAttemptInProgress || submitted || isAfterEnd || !hasStartedFullscreen) return;

    const handleViolation = () => {
      if (submitted || isAfterEnd) return;
      
      setFullscreenViolations(prev => {
        const newViolations = prev + 1;
        if (newViolations >= 3) {
          toast.error("Test auto-submitted due to 3 rule violations.");
          if (handleFinishTestRef.current) handleFinishTestRef.current(true);
          return newViolations;
        }
        
        setIsWarningActive(true);
        setWarningCountdown(5);
        return newViolations;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStartedFullscreen) handleViolation();
    };

    const handleBlur = () => {
      handleViolation();
    };
    
    // Disable right-click
    const handleContextMenu = (e) => e.preventDefault();
    
    // Disable shortcuts & Add helpful ones
    const handleKeyDown = (e) => {
      // 1. Anti-cheat (Blocked)
      if (
        (e.ctrlKey && ['c', 'v'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')
      ) {
        e.preventDefault();
        return;
      }

      // 2. Helpful Shortcuts (Active)
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitQuestion();
        } else {
          handleRun();
        }
        return;
      }

      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIdx(prev => Math.min(questions.length - 1, prev + 1));
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIdx(prev => Math.max(0, prev - 1));
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleResetCode();
        return;
      }

      // Format Code (Shift + Alt + F)
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (editorRef.current) {
          editorRef.current.formatCode();
        }
        return;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [test, isAttemptInProgress, submitted, isAfterEnd, hasStartedFullscreen, questions.length, handleRun, handleSubmitQuestion, handleResetCode]);

  useEffect(() => {
    if (!isWarningActive || submitted) return;

    if (warningCountdown <= 0) {
      toast.error("Your test has been submitted due to rule violation.");
      if (handleFinishTestRef.current) handleFinishTestRef.current(true);
      setIsWarningActive(false);
      return;
    }

    const timer = setInterval(() => {
      setWarningCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isWarningActive, warningCountdown, submitted]);

  // --- End Proctoring Logic ---

  if (!test) return (
     <div className="h-screen flex flex-col items-center justify-center bg-[#09090b] gap-6">
        <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-accent animate-spin shadow-accent/30"></div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Loading Test Resources...</p>
     </div>
  );

  if (isBeforeStart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#09090b] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="bg-[#111111] p-12 text-center max-w-md w-full border border-white/5 rounded-[40px] shadow-2xl relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Clock className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 uppercase tracking-tight font-outfit">Test Not Started</h1>
          <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight leading-tight">This test has not started yet.</h2>
          
          <div className="bg-black/40 rounded-3xl p-8 border border-white/5 mb-8 shadow-inner">
                <p className="text-accent text-sm font-bold uppercase tracking-[0.3em] mb-12">Starts In</p>
            <p className="text-accent text-5xl font-bold font-mono tracking-tighter">{waitCountdown || "00:00:00"}</p>
          </div>
                    <p className="mt-8 text-gray-700 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Waiting for test to start...</p>
        </div>
      </div>
    );
  }

  if (isAfterEnd && !isAttemptInProgress && !submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#09090b]">
        <div className="bg-[#111111] p-12 text-center max-w-md w-full border border-white/5 rounded-[40px] shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 uppercase tracking-tight font-outfit">Window Closed</h1>
                <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight leading-tight">The test has ended. Submissions are no longer allowed.</h2>
          <button 
            onClick={() => navigate('/student')}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all border border-slate-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Proctoring Entrance Screen ---
  if (test && !isBeforeStart && !isAfterEnd && !hasStartedFullscreen && !submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#09090b] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="bg-[#111111] p-12 text-center max-w-lg w-full border border-white/5 rounded-[48px] shadow-2xl relative z-10">
          <div className="w-24 h-24 rounded-4xl bg-accent/10 flex items-center justify-center mx-auto mb-10 border border-accent/20">
            <Monitor className="w-12 h-12 text-accent" />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tight font-outfit leading-none">Security Protocol</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10 italic">Secure Examination environment ready</p>
          
          <div className="space-y-4 mb-12 text-left bg-black/40 p-8 rounded-3xl border border-white/5">
            <div className="flex items-start gap-4">
               <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">1</div>
               <p className="text-xs text-slate-400 font-medium leading-relaxed pt-1">Test will be conducted in <span className="text-white font-bold italic">Full-screen Mode</span> only.</p>
            </div>
            <div className="flex items-start gap-4">
               <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 text-amber-400 font-bold text-[10px]">2</div>
               <p className="text-xs text-slate-400 font-medium leading-relaxed pt-1">Tab switching or window minimization is <span className="text-rose-400 font-bold italic">Prohibited</span>.</p>
            </div>
            <div className="flex items-start gap-4">
               <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-400 font-bold text-[10px]">3</div>
               <p className="text-xs text-slate-400 font-medium leading-relaxed pt-1">Exiting secure mode more than <span className="text-white font-bold italic text-sm">3 times</span> results in <span className="text-rose-500 font-black italic">Auto-submission</span>.</p>
            </div>
          </div>
          
          <button 
            onClick={async () => {
              try {
                await document.documentElement.requestFullscreen();
                setHasStartedFullscreen(true);
              } catch (err) {
                toast.error("Full-screen permission is required to start the test.");
              }
            }}
            className="w-full py-5 bg-accent hover:bg-accent-dark text-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 group"
          >
            <span>Enter Secure Environment</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-8 text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em] animate-pulse italic">Awaiting User authorization gesture...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const totalPossibleMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    return (
      <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]"></div>

        <div className="bg-[#111111] border border-white/10 rounded-[48px] shadow-2xl p-14 max-w-xl w-full text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-white">
              <Trophy size={200} />
           </div>
           
           <div className="relative z-10 flex flex-col items-center gap-10">
              <div className="w-24 h-24 rounded-[32px] bg-accent text-black flex items-center justify-center shadow-accent/30">
                 <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              
              <div className="space-y-3">
                 <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">Submission Accepted</h2>
                    <span className="text-gray-700 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Waiting for execution...</span>
              </div>

              {testResult && (
                <div className="grid grid-cols-2 gap-8 w-full py-8 border-y border-white/5 text-left">
                  <div className="text-center group">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 group-hover:text-accent transition-colors">Score</p>
                    <button onClick={handleResetCode} className="p-2 text-gray-500 hover:text-white transition-colors" title="Reset Code">
                      {testResult.totalScore} <span className="text-gray-700 text-xs lowercase">/ {totalPossibleMarks} pts</span>
                    </button>
                  </div>
                  <div className="text-center group">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 group-hover:text-accent transition-colors">Precision Hub</p>
                    <p className="text-3xl font-bold text-white font-mono tracking-tighter">{testResult.overallAccuracy?.toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {testResult?.questionResults && (
                <div className="w-full text-left space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar px-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Accuracy Breakdown</p>
                  {testResult.questionResults.map((qr, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/[0.04] transition-all hover:border-white/10 group/item">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${qr.status === 'Solved' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-white/5 text-gray-600 border-white/5'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-white group-hover/item:text-accent transition-colors">{qr.title}</p>
                          <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-0.5">{qr.testcasesPassed}/{qr.totalTestcases} Test Clusters Valid</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] font-bold text-white">{qr.score?.toFixed(1)} <span className="text-[10px] text-gray-700 font-bold">pts</span></p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${qr.status === 'Solved' ? 'text-accent' : 'text-gray-600'}`}>{qr.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
    </div>
    );
  }

  const renderProblemPanel = () => (
    <div className="h-full flex flex-col bg-[#111111] border-r border-white/5">
      <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-black/40">
        <div className="flex items-center gap-4">
           <span className="w-8 h-8 bg-zinc-800 text-accent rounded-lg flex items-center justify-center text-[11px] font-bold border border-white/10 shadow-xl">{activeIdx + 1}</span>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Problem Description</h2>
        </div>
        <div className="flex items-center gap-4">
           {resultsByQuestion[activeQuestion?.id] && (
             <span className="flex items-center gap-2 text-accent text-[10px] font-bold uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
               <Zap size={12} fill="currentColor" /> Evaluated
             </span>
           )}
           <span className="bg-white/5 border border-white/10 text-gray-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl">
             {activeQuestion?.marks} Marks
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
        <div className="flex items-center justify-between pb-8 border-b border-white/5">
           <div className="flex gap-2.5">
             {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border flex items-center justify-center ${i === activeIdx ? 'bg-accent text-black border-accent shadow-accent/20' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20 hover:text-white'}`}
                >
                  {i + 1}
                </button>
             ))}
           </div>
           <div className="flex items-center gap-3">
             <button onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white shadow-xl disabled:opacity-20 transition-all hover:bg-white/10" disabled={activeIdx === 0}>
                <ChevronLeft size={20} />
             </button>
             <button onClick={() => setActiveIdx(Math.min(questions.length - 1, activeIdx + 1))} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white shadow-xl disabled:opacity-20 transition-all hover:bg-white/10" disabled={activeIdx === questions.length - 1}>
                <ChevronRight size={20} />
             </button>
           </div>
        </div>

        {activeQuestion && (
          <div className="animate-fade-in space-y-12">
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-white tracking-tight uppercase font-outfit">{activeQuestion.title}</h2>
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest ${activeQuestion.difficulty === 'EASY' ? 'bg-accent/10 text-accent border-accent/20' : activeQuestion.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'}`}>
                    {activeQuestion.difficulty}
                  </span>
               </div>
               <p className="text-gray-400 text-[15px] leading-relaxed font-medium whitespace-pre-wrap font-inter">{activeQuestion.description}</p>
            </div>

            <div className="grid gap-12 pt-4">
               {activeQuestion.inputFormat && (
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-6 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                       Sample Case
                    </h3>
                   <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-gray-400 text-sm font-medium leading-relaxed shadow-inner">
                     {activeQuestion.inputFormat}
                   </div>
                 </div>
               )}
               {activeQuestion.constraints && (
                 <div className="space-y-4">
                   <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Domain Constraints
                   </h3>
                   <div className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-white text-[13px] font-bold shadow-2xl">
                     {activeQuestion.constraints}
                   </div>
                 </div>
               )}
            </div>

            <div className="space-y-8 pt-6">
              <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Example Interactions
              </h3>
              {activeQuestion.testCases?.filter((tc) => !tc.isHidden).map((tc, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl transition-all hover:border-white/10 group">
                  <div className="bg-white/5 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Sample Test Case {i + 1}</span>
                  </div>
                  <div className="p-8 grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                       <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Input</p>
                       <pre className="bg-black border border-white/5 rounded-2xl p-5 text-accent text-[12px] font-mono shadow-inner shadow-black opacity-80 group-hover:opacity-100 transition-opacity">{tc.input || 'None'}</pre>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Expected Output</p>
                       <pre className="bg-black/60 border border-white/5 rounded-2xl p-5 text-white text-[12px] font-mono shadow-inner shadow-black">{tc.expectedOutput}</pre>
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
    <div className="h-full flex flex-col bg-[#0b0b0b]">
       <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-black/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
             <div className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 shadow-accent/10">
                <Code2 size={16} strokeWidth={2.5} />
             </div>
             <h3 className="text-[10px] font-bold text-white px-3 py-1 rounded-lg bg-white/5 uppercase tracking-widest border border-white/5 shadow-xl">Kernel v4.0.2 [Java]</h3>
          </div>
          <div className="flex items-center gap-6">
             <button
                onClick={handleResetCode}
                disabled={submitted}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-accent transition-all group"
                title="Reset to Template"
             >
                <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                Reset Code
             </button>
             <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-accent"></div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">Auto-saving...</span>
             </div>
          </div>
       </div>
       <div className="flex-1 min-h-0 relative">
          <LiveTestEditorComponent
            ref={editorRef}
            key={activeQuestion?.id}
            testId={id}
            questionId={activeQuestion?.id}
            code={activeCode}
            onChange={(val) => setCodeMap((prev) => ({ ...prev, [activeQuestion?.id]: val }))}
            setCodeMap={setCodeMap}
            isAttemptInProgress={isAttemptInProgress}
            onRun={handleRun}
            onSubmit={handleSubmitQuestion}
            onReset={handleResetCode}
            onPrev={() => setActiveIdx(prev => Math.max(0, prev - 1))}
            onNext={() => setActiveIdx(prev => Math.min(questions.length - 1, prev + 1))}
          />
       </div>
    </div>
  );

  const renderConsole = () => (
    <div className="h-full flex flex-col bg-black border-t border-white/5 relative overflow-hidden">
       {/* Terminal Scanline Effect */}
       <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-50 bg-[length:100%_2px,3px_100%]"></div>

       <div className="h-12 px-8 border-b border-white/5 bg-black/80 backdrop-blur-md flex items-center justify-between shrink-0 relative z-40">
          <div className="flex items-center gap-8">
             <button
               onClick={handleRun}
               disabled={running || submitting || submitted}
               className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-all disabled:opacity-20 group"
             >
               <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-all">
                  <Play size={12} fill="currentColor" strokeWidth={0} />
               </div>
               {running ? "Compiling..." : "Run Test Sample"}
             </button>
             <button
               onClick={handleSubmitQuestion}
               disabled={submitting || submitted || running}
               className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-accent transition-all disabled:opacity-20 group"
             >
               <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-all">
                  <Send size={12} strokeWidth={2.5} />
               </div>
               {submitting ? "Submitting..." : "Submit Answer"}
             </button>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
             <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] font-mono">Console Output</p>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-8 bg-black/40 custom-scrollbar font-mono text-[13px] relative z-40">
          {currentResult && (
            <div className="mb-8 p-6 bg-accent/5 border border-accent/10 rounded-[24px] flex items-center justify-between shadow-accent/3 backdrop-blur-sm group transition-all hover:border-accent/30">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-accent text-black flex items-center justify-center shadow-accent/20 group-hover:scale-110 transition-transform">
                     <CheckCircle2 size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-0.5">Submission Accepted</p>
                     <p className="text-white text-lg font-bold tracking-tight">Score: {currentResult.score?.toFixed(1)} <span className="text-gray-600 text-xs">/ {activeQuestion?.marks}</span></p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Accuracy</p>
                  <p className="text-2xl font-bold text-white leading-none font-mono tracking-tighter">{((currentResult.testcasesPassed / currentResult.totalTestcases) * 100).toFixed(1)}%</p>
               </div>
            </div>
          )}

          {currentOutput && (
            <div className="space-y-8 animate-fade-in">
               {currentOutput.testCaseResults && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentOutput.testCaseResults.map((tc, i) => (
                      <div key={i} className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all ${tc.passed ? "bg-accent/5 border-accent/10 hover:border-accent/30" : "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30"}`}>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {tc.passed ? <CheckCircle2 size={16} className="text-accent" /> : <XCircle size={16} className="text-rose-500" />}
                              <span className={`text-[11px] font-bold uppercase tracking-widest ${tc.passed ? "text-accent" : "text-rose-500"}`}>Case {i + 1}</span>
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-30 text-gray-500">{tc.passed ? "Success" : "Deviation"}</span>
                         </div>
                         {!tc.passed && tc.actualOutput && (
                            <div className="space-y-2 mt-1">
                               <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">Actual Output</p>
                               <div className="text-[11px] text-rose-400 font-mono bg-black/60 p-3 rounded-xl border border-rose-900/10 max-h-[80px] overflow-y-auto whitespace-pre-wrap break-all shadow-inner">
                                  {tc.actualOutput}
                               </div>
                            </div>
                         )}
                      </div>
                    ))}
                 </div>
               )}
               {(currentOutput.output || currentOutput.error) && (
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                       <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Output</p>
                    </div>
                    <pre className={`p-6 rounded-3xl border bg-black/60 text-[13px] leading-relaxed whitespace-pre-wrap font-mono shadow-2xl ${currentOutput.error ? 'border-rose-900/20 text-rose-400' : 'border-white/5 text-gray-400'}`}>
                      {currentOutput.error || currentOutput.output}
                    </pre>
                 </div>
               )}
            </div>
          )}

          {!currentOutput && !currentResult && (
            <div className="flex flex-col items-center justify-center h-full gap-5 opacity-10">
               <Monitor size={64} className="text-white" strokeWidth={1} />
               <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em]">Awaiting Simulation Data...</p>
            </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#09090b] text-white font-sans selection:bg-accent selection:text-black">
      <header className="h-16 border-b border-white/5 bg-black px-8 flex items-center justify-between flex-shrink-0 z-30 shadow-2xl">
        <div className="flex items-center gap-5">
           <div className="p-2 border border-white/10 rounded-xl bg-white/5 shadow-xl text-accent">
             <Trophy size={20} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-[17px] font-bold text-white tracking-tight leading-none uppercase font-outfit">{test.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                 <span className="text-[9px] font-bold text-black bg-accent px-2 py-0.5 rounded uppercase tracking-widest">Active Thread</span>
                 <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{questions.length} Vectors Encrypted</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8 text-white">
           {/* Shortcuts Legend (Desktop only) */}
           {!isMobile && (
             <div className="flex items-center gap-6 pr-6 border-r border-white/5">
                {[
                  { k: "Ctrl + Enter", l: "Run" },
                  { k: "Ctrl + ⇧ + Enter", l: "Submit" },
                  { k: "Alt + ← / →", l: "Switch Question" },
                  { k: "⌥ + ⇧ + F", l: "Format" },
                  { k: "Alt + R", l: "Reset" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-1 items-center group cursor-default">
                     <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest group-hover:text-accent transition-colors">{s.l}</span>
                     <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-mono font-black text-slate-400 group-hover:border-accent/40 group-hover:text-white transition-all">{s.k}</kbd>
                  </div>
                ))}
             </div>
           )}

           {countdown && (
             <div className={`flex items-center gap-4 px-5 py-2.5 rounded-2xl border transition-all ${countdown.includes("s") && !countdown.includes("m") && !countdown.includes("h") ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' : 'bg-white/5 border-white/10 text-white shadow-xl'}`}>
                <Clock size={16} className={countdown.includes("s") && !countdown.includes("m") ? 'text-rose-500' : 'text-accent'} />
                <div className="flex flex-col -space-y-0.5">
                   <span className="text-[8px] font-bold uppercase tracking-widest opacity-40 leading-none">Termination In</span>
                   <span className="font-mono text-xl font-bold tracking-tighter leading-none">{countdown}</span>
                </div>
             </div>
           )}

           <button
             onClick={() => handleFinishTest()}
             disabled={submitting || submitted}
             className="bg-accent hover:bg-accent-dark text-black font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest text-[11px] shadow-accent/10"
           >
             Initialize Finalization <ArrowRight size={18} strokeWidth={2.5} />
           </button>
        </div>
      </header>

      {isMobile && (
        <div className="h-14 bg-black border-b border-white/5 flex p-1.5 gap-2 shrink-0 relative z-30">
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${mobileTab === "problem" ? "bg-accent text-black shadow-accent/10" : "text-gray-500 hover:text-white bg-white/5"}`}
            onClick={() => setMobileTab("problem")}
          >
            <FileText size={14} /> Description
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${mobileTab === "editor" ? "bg-accent text-black shadow-accent/10" : "text-gray-500 hover:text-white bg-white/5"}`}
            onClick={() => setMobileTab("editor")}
          >
            <Code2 size={14} /> Workspace
          </button>
        </div>
      )}

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
            <Panel defaultSize={40} minSize={30}>
              {renderProblemPanel()}
            </Panel>
            <PanelResizeHandle className="w-1 bg-black hover:bg-accent/30 transition-all cursor-col-resize active:bg-accent shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]" />
            <Panel defaultSize={60} minSize={40}>
              <div className="flex flex-col h-full">
                <div className="flex-1">{renderEditorArea()}</div>
                <div className="h-[280px]">{renderConsole()}</div>
              </div>
            </Panel>
          </PanelGroup>
        )}
      </div>

      {/* Proctoring Warning Overlay */}
      {isWarningActive && !submitted && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
          <div className="max-w-md w-full mx-4 p-12 bg-[#111111] border-2 border-rose-500/30 rounded-[40px] text-center shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
               <div className="h-full bg-rose-500 transition-all duration-1000 ease-linear" style={{ width: `${(warningCountdown / 5) * 100}%` }}></div>
            </div>
            
            <div className="w-24 h-24 rounded-[32px] bg-rose-500/10 flex items-center justify-center mx-auto mb-10 border border-rose-500/20 animate-bounce">
              <XCircle className="w-12 h-12 text-rose-500" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Security Violation</h2>
            <p className="text-rose-400 font-black text-sm uppercase tracking-widest mb-2">Strike {fullscreenViolations} / 3</p>
            
            <div className="bg-rose-500/5 rounded-3xl p-8 border border-rose-500/10 mb-10">
               <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6 italic">Warning: Do not leave the test screen. Multiple violations will result in automatic submission.</p>
               <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">Auto-submission In</p>
                  <p className="text-6xl font-black text-white font-mono tracking-tighter">{warningCountdown}s</p>
               </div>
            </div>
            
            <button
              onClick={async () => {
                try {
                  await document.documentElement.requestFullscreen();
                  setIsWarningActive(false);
                } catch (err) {
                  toast.error("Enter full-screen to resume test");
                }
              }}
              className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 animate-pulse"
            >
              <span>Return to Full-screen</span>
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

}
