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
    if (test && !isBeforeStart && !isAfterEnd && !isAttemptInProgress && !submitted) {
       studentService
        .startAttempt(id)
        .then(() => setIsAttemptInProgress(true))
        .catch((err) => {
          if (err.response?.status === 403 || err.response?.status === 400) {
            setSubmitted(true);
            toast.error(err.response?.data?.error || "Test ALREADY submitted and evaluated!");
            sessionStorage.removeItem(`test_code_${id}`);
            sessionStorage.removeItem(`test_idx_${id}`);
          }
        });
    }
  }, [test, isBeforeStart, isAfterEnd, isAttemptInProgress, submitted, id]);

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
    const client = Stomp.over(() => new SockJS(wsUrl));
    client.debug = () => {}; 

    const sendStatus = (status) => {
      if (client.connected) {
        client.send(`/app/test/${id}/status`, {}, JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          testId: id,
          status: status,
          questionsSolved: Object.keys(resultsByQuestion).length,
          totalQuestions: questions.length
        }));
      }
    };

    client.connect({}, () => {
      sendStatus('RECONNECT');
    });

    if (Object.keys(resultsByQuestion).length > 0) {
      sendStatus('PROGRESS');
    }

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
        client.debug = null;
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

  if (!test) return (
     <div className="h-screen flex flex-col items-center justify-center bg-[#09090b] gap-6">
        <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-[#2df07b] animate-spin shadow-[0_0_15px_rgba(45,240,123,0.3)]"></div>
        <div className="text-[#2df07b] text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Initializing Data Stream</div>
     </div>
  );

  if (isBeforeStart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#09090b] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2df07b]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="bg-[#111111] p-12 text-center max-w-md w-full border border-white/5 rounded-[40px] shadow-2xl relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Clock className="w-10 h-10 text-[#2df07b] animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 uppercase tracking-tight font-outfit">Test Not Started</h1>
          <p className="text-gray-500 mb-10 font-medium">This assessment protocol is currently encrypted.</p>
          
          <div className="bg-black/40 rounded-3xl p-8 border border-white/5 mb-8 shadow-inner">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Release Window In</p>
            <p className="text-[#2df07b] text-5xl font-bold font-mono tracking-tighter">{waitCountdown || "00:00:00"}</p>
          </div>
          
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest animate-pulse">Awaiting Signal... Stay on this frequency.</p>
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
          <p className="text-gray-500 mb-10 font-medium font-inter">The assessment window has terminated. Access is no longer permitted.</p>
          <button 
            onClick={() => navigate('/student')}
            className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white hover:text-black text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl active:scale-95 text-xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const totalPossibleMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    return (
      <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#2df07b]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#2df07b]/5 rounded-full blur-[100px]"></div>

        <div className="bg-[#111111] border border-white/10 rounded-[48px] shadow-2xl p-14 max-w-xl w-full text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-white">
              <Trophy size={200} />
           </div>
           
           <div className="relative z-10 flex flex-col items-center gap-10">
              <div className="w-24 h-24 rounded-[32px] bg-[#2df07b] text-black flex items-center justify-center shadow-[0_0_30px_rgba(45,240,123,0.3)]">
                 <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              
              <div className="space-y-3">
                 <h1 className="text-4xl font-bold text-white uppercase tracking-tight font-outfit">Protocol Evaluated</h1>
                 <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.3em] font-inter">{test.name}</p>
              </div>

              {testResult && (
                <div className="grid grid-cols-2 gap-8 w-full py-8 border-y border-white/5 text-left">
                  <div className="text-center group">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 group-hover:text-[#2df07b] transition-colors">Yield Metric</p>
                    <p className="text-3xl font-bold text-white font-mono tracking-tighter">
                      {testResult.totalScore} <span className="text-gray-700 text-xs lowercase">/ {totalPossibleMarks} pts</span>
                    </p>
                  </div>
                  <div className="text-center group">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 group-hover:text-[#2df07b] transition-colors">Precision Hub</p>
                    <p className="text-3xl font-bold text-white font-mono tracking-tighter">{testResult.overallAccuracy?.toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {testResult?.questionResults && (
                <div className="w-full text-left space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar px-3">
                  <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Vector Breakdown</h3>
                  {testResult.questionResults.map((qr, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/[0.04] transition-all hover:border-white/10 group/item">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${qr.status === 'Solved' ? 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20' : 'bg-white/5 text-gray-600 border-white/5'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-white group-hover/item:text-[#2df07b] transition-colors">{qr.title}</p>
                          <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-0.5">{qr.testcasesPassed}/{qr.totalTestcases} Test Clusters Valid</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] font-bold text-white">{qr.score?.toFixed(1)} <span className="text-[10px] text-gray-700 font-bold">pts</span></p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${qr.status === 'Solved' ? 'text-[#2df07b]' : 'text-gray-600'}`}>{qr.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-gray-600 text-[13px] font-medium px-4 leading-relaxed font-inter">
                Assessment data has been transmitted to the neural bank.
              </p>

              <button
                onClick={() => navigate("/student")}
                className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-4.5 px-8 rounded-2xl transition-all shadow-[0_0_25px_rgba(45,240,123,0.15)] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                Return to Hub <ArrowRight size={20} strokeWidth={2.5} />
              </button>
           </div>
        </div>
      </div>
    );
  }

  const renderProblemPanel = () => (
    <div className="h-full flex flex-col bg-[#111111] border-r border-white/5">
      <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-black/40">
        <div className="flex items-center gap-4">
           <span className="w-8 h-8 bg-zinc-800 text-[#2df07b] rounded-lg flex items-center justify-center text-[11px] font-bold border border-white/10 shadow-xl">{activeIdx + 1}</span>
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Problem Specification</h3>
        </div>
        <div className="flex items-center gap-4">
           {resultsByQuestion[activeQuestion?.id] && (
             <span className="flex items-center gap-2 text-[#2df07b] text-[10px] font-bold uppercase tracking-widest bg-[#2df07b]/10 px-3 py-1 rounded-full border border-[#2df07b]/20">
               <Zap size={12} fill="#2df07b" /> Evaluated
             </span>
           )}
           <span className="bg-white/5 border border-white/10 text-gray-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl">
             {activeQuestion?.marks} Yield
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
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border flex items-center justify-center ${i === activeIdx ? 'bg-[#2df07b] text-black border-[#2df07b] shadow-[0_0_15px_rgba(45,240,123,0.2)]' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20 hover:text-white'}`}
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
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest ${activeQuestion.difficulty === 'EASY' ? 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20' : activeQuestion.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {activeQuestion.difficulty}
                  </span>
               </div>
               <p className="text-gray-400 text-[15px] leading-relaxed font-medium whitespace-pre-wrap font-inter">{activeQuestion.description}</p>
            </div>

            <div className="grid gap-12 pt-4">
               {activeQuestion.inputFormat && (
                 <div className="space-y-4">
                   <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#2df07b]"></div> Standard Input Format
                   </h3>
                   <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-gray-400 text-sm font-medium leading-relaxed shadow-inner">
                     {activeQuestion.inputFormat}
                   </div>
                 </div>
               )}
               {activeQuestion.constraints && (
                 <div className="space-y-4">
                   <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#2df07b]"></div> Domain Constraints
                   </h3>
                   <div className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-white text-[13px] font-bold shadow-2xl">
                     {activeQuestion.constraints}
                   </div>
                 </div>
               )}
            </div>

            <div className="space-y-8 pt-6">
              <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2df07b]"></div> Example Interactions
              </h3>
              {activeQuestion.testCases?.filter((tc) => !tc.isHidden).map((tc, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl transition-all hover:border-white/10 group">
                  <div className="bg-white/5 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Sample Vector {i + 1}</span>
                  </div>
                  <div className="p-8 grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                       <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Input Stream</p>
                       <pre className="bg-black border border-white/5 rounded-2xl p-5 text-[#2df07b] text-[12px] font-mono shadow-inner shadow-black opacity-80 group-hover:opacity-100 transition-opacity">{tc.input || 'None'}</pre>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Expected Yield</p>
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
             <div className="p-1.5 rounded-lg bg-[#2df07b]/10 text-[#2df07b] border border-[#2df07b]/20 shadow-[0_0_15px_rgba(45,240,123,0.1)]">
                <Code2 size={16} strokeWidth={2.5} />
             </div>
             <h3 className="text-[10px] font-bold text-white px-3 py-1 rounded-lg bg-white/5 uppercase tracking-widest border border-white/5 shadow-xl">Kernel v4.0.2 [Java]</h3>
          </div>
          <div className="flex items-center gap-6">
             <button
                onClick={handleResetCode}
                disabled={submitted}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#2df07b] transition-all group"
                title="Reset to Template"
             >
                <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                Reset Vector
             </button>
             <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2df07b] animate-pulse shadow-[0_0_8px_#2df07b]"></div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">Encrypted Sync</span>
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
    <div className="h-full flex flex-col bg-black border-t border-white/5 relative overflow-hidden">
       {/* Terminal Scanline Effect */}
       <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-50 bg-[length:100%_2px,3px_100%]"></div>

       <div className="h-12 px-8 border-b border-white/5 bg-black/80 backdrop-blur-md flex items-center justify-between shrink-0 relative z-40">
          <div className="flex items-center gap-8">
             <button
               onClick={handleRun}
               disabled={running || submitting || submitted}
               className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-[#2df07b] hover:text-white transition-all disabled:opacity-20 group"
             >
               <div className="w-6 h-6 rounded-lg bg-[#2df07b]/10 flex items-center justify-center group-hover:bg-[#2df07b] group-hover:text-black transition-all">
                  <Play size={12} fill="currentColor" strokeWidth={0} />
               </div>
               {running ? "Compiling..." : "Run Test Sample"}
             </button>
             <button
               onClick={handleSubmitQuestion}
               disabled={submitting || submitted || running}
               className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-[#2df07b] transition-all disabled:opacity-20 group"
             >
               <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#2df07b] group-hover:text-black transition-all">
                  <Send size={12} strokeWidth={2.5} />
               </div>
               {submitting ? "Transmitting..." : "Submit Vector"}
             </button>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
             <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] font-mono">Console STDOUT</p>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-8 bg-black/40 custom-scrollbar font-mono text-[13px] relative z-40">
          {currentResult && (
            <div className="mb-8 p-6 bg-[#2df07b]/5 border border-[#2df07b]/10 rounded-[24px] flex items-center justify-between shadow-[0_0_30px_rgba(45,240,123,0.03)] backdrop-blur-sm group transition-all hover:border-[#2df07b]/30">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#2df07b] text-black flex items-center justify-center shadow-[0_0_20px_rgba(45,240,123,0.2)] group-hover:scale-110 transition-transform">
                     <CheckCircle2 size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-[#2df07b] uppercase tracking-[0.2em] mb-0.5">Vector Validated</p>
                     <p className="text-white text-lg font-bold tracking-tight">Yield: {currentResult.score?.toFixed(1)} <span className="text-gray-600 text-xs">/ {activeQuestion?.marks}</span></p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Efficiency Rating</p>
                  <p className="text-2xl font-bold text-white leading-none font-mono tracking-tighter">{((currentResult.testcasesPassed / currentResult.totalTestcases) * 100).toFixed(1)}%</p>
               </div>
            </div>
          )}

          {currentOutput && (
            <div className="space-y-8 animate-fade-in">
               {currentOutput.testCaseResults && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentOutput.testCaseResults.map((tc, i) => (
                      <div key={i} className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all ${tc.passed ? "bg-[#2df07b]/5 border-[#2df07b]/10 hover:border-[#2df07b]/30" : "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30"}`}>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {tc.passed ? <CheckCircle2 size={16} className="text-[#2df07b]" /> : <XCircle size={16} className="text-rose-500" />}
                              <span className={`text-[11px] font-bold uppercase tracking-widest ${tc.passed ? "text-[#2df07b]" : "text-rose-500"}`}>Case {i + 1}</span>
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-30 text-gray-500">{tc.passed ? "Success" : "Deviation"}</span>
                         </div>
                         {!tc.passed && tc.actualOutput && (
                            <div className="space-y-2 mt-1">
                               <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">Observable Delta</p>
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
                       <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Buffer Stream</p>
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
    <div className="h-screen flex flex-col overflow-hidden bg-[#09090b] text-white font-sans selection:bg-[#2df07b] selection:text-black">
      <header className="h-16 border-b border-white/5 bg-black px-8 flex items-center justify-between flex-shrink-0 z-30 shadow-2xl">
        <div className="flex items-center gap-5">
           <div className="p-2 border border-white/10 rounded-xl bg-white/5 shadow-xl text-[#2df07b]">
             <Trophy size={20} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-[17px] font-bold text-white tracking-tight leading-none uppercase font-outfit">{test.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                 <span className="text-[9px] font-bold text-black bg-[#2df07b] px-2 py-0.5 rounded uppercase tracking-widest">Active Thread</span>
                 <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{questions.length} Vectors Encrypted</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8">
           {countdown && (
             <div className={`flex items-center gap-4 px-5 py-2.5 rounded-2xl border transition-all ${countdown.includes("s") && !countdown.includes("m") && !countdown.includes("h") ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' : 'bg-white/5 border-white/10 text-white shadow-xl'}`}>
                <Clock size={16} className={countdown.includes("s") && !countdown.includes("m") ? 'text-rose-500' : 'text-[#2df07b]'} />
                <div className="flex flex-col -space-y-0.5">
                   <span className="text-[8px] font-bold uppercase tracking-widest opacity-40 leading-none">Termination In</span>
                   <span className="font-mono text-xl font-bold tracking-tighter leading-none">{countdown}</span>
                </div>
             </div>
           )}

           <button
             onClick={() => handleFinishTest()}
             disabled={submitting || submitted}
             className="bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest text-[11px] shadow-[#2df07b]/10"
           >
             Initialize Finalization <ArrowRight size={18} strokeWidth={2.5} />
           </button>
        </div>
      </header>

      {isMobile && (
        <div className="h-14 bg-black border-b border-white/5 flex p-1.5 gap-2 shrink-0 relative z-30">
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${mobileTab === "problem" ? "bg-[#2df07b] text-black shadow-[0_0_15px_rgba(45,240,123,0.1)]" : "text-gray-500 hover:text-white bg-white/5"}`}
            onClick={() => setMobileTab("problem")}
          >
            <FileText size={14} /> Description
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${mobileTab === "editor" ? "bg-[#2df07b] text-black shadow-[0_0_15px_rgba(45,240,123,0.1)]" : "text-gray-500 hover:text-white bg-white/5"}`}
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
            <PanelResizeHandle className="w-1 bg-black hover:bg-[#2df07b]/30 transition-all cursor-col-resize active:bg-[#2df07b] shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]" />
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
