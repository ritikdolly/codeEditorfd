import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  Play, Send, Clock, CheckCircle2, XCircle, AlertTriangle, FileText, Code
} from 'lucide-react';

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
  if (remaining === null) return '';
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${h > 0 ? `${h}h ` : ''}${m}m ${String(s).padStart(2, '0')}s`;
}

export function LiveTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  // Mobile tab: 'problem' | 'editor'
  const [mobileTab, setMobileTab] = useState('problem');

  const endMs = test?.endTime ? new Date(test.endTime).getTime() : null;
  const countdown = useCountdown(endMs);

  useEffect(() => {
    studentService.getTest(id).then(setTest).catch(() => toast.error('Test not found'));
    studentService.getTestQuestions(id).then(setQuestions).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (countdown === '0m 00s' && !submitted && questions.length > 0) {
      toast('⏰ Time is up! Auto-submitting...', { icon: '⏰' });
      handleSubmit();
    }
  }, [countdown]);

  const activeQuestion = questions[activeIdx];

  const handleRun = async () => {
    if (!activeQuestion) return;
    setRunning(true);
    setOutput(null);
    // Switch to editor tab on mobile so user can see output
    setMobileTab('editor');
    try {
      const sampleTestCases = activeQuestion.testCases?.filter(tc => !tc.isHidden).map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })) || [];

      const res = await studentService.runCode({
        code,
        language: 'java',
        sampleTestCases: sampleTestCases.length > 0 ? sampleTestCases : undefined,
        input: sampleTestCases.length === 0 ? '' : undefined,
      });
      setOutput(res);
    } catch (err) {
      toast.error('Execution failed. Check your code.');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuestion || submitted) return;
    setSubmitting(true);
    try {
      const res = await studentService.submitCode({
        questionId: activeQuestion.id,
        testId: id,
        code,
        language: 'java',
      });
      setResult(res);
      setSubmitted(true);
      toast.success(`Submitted! Score: ${res.score?.toFixed(1)} / ${activeQuestion.marks}`);
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!test) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-gradient)' }}>
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="font-bold text-white text-base sm:text-lg truncate">{test.name}</h1>
          <p className="text-slate-400 text-xs">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {countdown && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm ${parseInt(countdown) < 5 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-300'}`}>
              <Clock size={13} />
              <span className="font-mono font-semibold whitespace-nowrap">{countdown}</span>
            </div>
          )}
          <button onClick={handleSubmit} disabled={submitting || submitted}
            className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:px-4">
            <Send size={13} />
            <span className="hidden xs:inline sm:inline">
              {submitted ? 'Submitted' : submitting ? 'Submitting...' : 'Submit'}
            </span>
            <span className="xs:hidden sm:hidden">
              {submitted ? '✓' : submitting ? '...' : 'Sub'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="livetest-tabs">
        <button
          className={`livetest-tab ${mobileTab === 'problem' ? 'active' : ''}`}
          onClick={() => setMobileTab('problem')}
        >
          <FileText size={14} style={{ display: 'inline', marginRight: 6 }} />
          Problem
        </button>
        <button
          className={`livetest-tab ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          <Code size={14} style={{ display: 'inline', marginRight: 6 }} />
          Editor
        </button>
      </div>

      <div className="livetest-body flex-1">
        {/* Problem Panel */}
        <div className={`livetest-problem-panel space-y-4 ${mobileTab !== 'problem' ? 'livetest-panel-hidden' : ''}`}>
          {/* Question Nav */}
          {questions.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {questions.map((q, i) => (
                <button key={i} onClick={() => setActiveIdx(i)}
                  className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${i === activeIdx ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {activeQuestion ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{activeQuestion.title}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  activeQuestion.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                  activeQuestion.difficulty === 'HARD' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'}`}>
                  {activeQuestion.difficulty}
                </span>
                <span className="ml-auto text-sm text-slate-400">{activeQuestion.marks} marks</span>
              </div>

              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                {activeQuestion.description}
              </div>

              {activeQuestion.inputFormat && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">Input Format</h3>
                  <p className="text-slate-400 text-sm">{activeQuestion.inputFormat}</p>
                </div>
              )}
              {activeQuestion.outputFormat && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">Output Format</h3>
                  <p className="text-slate-400 text-sm">{activeQuestion.outputFormat}</p>
                </div>
              )}
              {activeQuestion.constraints && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">Constraints</h3>
                  <p className="text-slate-400 text-sm font-mono">{activeQuestion.constraints}</p>
                </div>
              )}

              {/* Sample Test Cases */}
              {activeQuestion.testCases?.filter(tc => !tc.isHidden).map((tc, i) => (
                <div key={i} className="bg-slate-800/60 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Example {i + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Input</p>
                      <pre className="bg-slate-900/80 rounded-lg p-2 text-slate-300 text-xs font-mono overflow-x-auto">{tc.input}</pre>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Output</p>
                      <pre className="bg-slate-900/80 rounded-lg p-2 text-slate-300 text-xs font-mono overflow-x-auto">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">Loading questions...</div>
          )}
        </div>

        {/* Editor + Output Panel */}
        <div className={`livetest-editor-panel ${mobileTab !== 'editor' ? 'livetest-panel-hidden' : ''}`}>
          <div className="flex-1" style={{ minHeight: 0, flex: 1 }}>
            <Editor
              height="100%"
              defaultLanguage="java"
              value={code}
              onChange={val => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="border-t border-slate-700/50 bg-slate-900/90 p-4 max-h-[220px] overflow-y-auto flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">Output</h3>
              <button onClick={handleRun} disabled={running}
                className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors">
                <Play size={14} />
                {running ? 'Running...' : 'Run Code'}
              </button>
            </div>

            {/* Submission Result */}
            {result && (
              <div className="mb-3 p-3 rounded-lg bg-slate-800/80 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-white font-semibold">Submission Result</span>
                </div>
                <p className="text-sm text-slate-300">
                  Score: <span className="text-green-400 font-bold">{result.score?.toFixed(1)}</span> · 
                  Accuracy: <span className="text-blue-400 font-bold">{result.accuracy?.toFixed(1)}%</span>
                </p>
              </div>
            )}

            {/* Run Output */}
            {output && (
              <div className="space-y-2">
                {output.testCaseResults?.map((tc, i) => (
                  <div key={i} className={`p-2.5 rounded-lg text-sm ${tc.passed ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <div className="flex items-center gap-2">
                      {tc.passed ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                      <span className={tc.passed ? 'text-green-400' : 'text-red-400'}>
                        Sample {i + 1}: {tc.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    {!tc.passed && tc.actualOutput && (
                      <pre className="mt-1 text-xs text-slate-400 font-mono">Got: {tc.actualOutput}</pre>
                    )}
                    {tc.error && <pre className="mt-1 text-xs text-red-400 font-mono">{tc.error}</pre>}
                  </div>
                ))}
                {output.output && (
                  <pre className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-2 font-mono">{output.output}</pre>
                )}
                {output.error && (
                  <pre className="text-sm text-red-400 bg-red-500/10 rounded-lg p-2 font-mono">{output.error}</pre>
                )}
              </div>
            )}

            {!output && !result && (
              <p className="text-slate-500 text-sm">Click "Run Code" to test against sample test cases</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
