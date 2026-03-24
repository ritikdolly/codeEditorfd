import { useState, useEffect } from 'react';
import { teacherService } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Trash2, Loader2, BookOpen, Code, Settings, Beaker, ArrowLeft, Info, HelpCircle, Save, Globe, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const emptyTestCase = { input: '', expectedOutput: '', isHidden: false };

export function CreateQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    expectedTimeComplexity: '',
    marks: 10,
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    prefixCode: '',
    suffixCode: '',
    templateCode: '',
    visibility: 'GLOBAL',
  });
  const [testCases, setTestCases] = useState([{ ...emptyTestCase }]);

  useEffect(() => {
    if (id) {
      teacherService.getQuestion(id)
        .then(data => {
          setForm({
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            expectedTimeComplexity: data.expectedTimeComplexity || '',
            marks: data.marks,
            inputFormat: data.inputFormat || '',
            outputFormat: data.outputFormat || '',
            constraints: data.constraints || '',
            prefixCode: data.prefixCode || '',
            suffixCode: data.suffixCode || '',
            templateCode: data.templateCode || '',
            visibility: data.visibility || 'PRIVATE',
          });
          if (data.testCases && data.testCases.length > 0) {
            setTestCases(data.testCases.map(tc => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden
            })));
          }
        })
        .catch(err => {
          toast.error('Failed to load question details');
          navigate('/teacher/questions');
        })
        .finally(() => setFetching(false));
    }
  }, [id, navigate]);

  const addTestCase = () => setTestCases([...testCases, { ...emptyTestCase }]);
  const removeTestCase = (i) => setTestCases(testCases.filter((_, idx) => idx !== i));
  const updateTestCase = (i, field, value) => {
    const updated = [...testCases];
    updated[i] = { ...updated[i], [field]: value };
    setTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await teacherService.updateQuestion(id, { ...form, testCases });
        toast.success('Question updated successfully!');
      } else {
        await teacherService.createQuestion({ ...form, testCases });
        toast.success('Question created successfully!');
      }
      navigate('/teacher/questions');
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${id ? 'update' : 'create'} question`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-4">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-bold uppercase tracking-widest text-xs">Loading Question...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button onClick={() => navigate('/teacher/questions')} className="flex items-center gap-2 text-slate-500 hover:text-purple-400 font-bold text-xs uppercase tracking-widest transition-colors mb-4 group">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Questions
          </button>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">{id ? 'Edit Question' : 'Create Question'}</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">{id ? 'Update the details of your coding question.' : 'Create a new coding question for assessments.'}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Core Metadata Section */}
        <div className="glass-card p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden group bg-slate-900/40">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen size={120} className="text-purple-400" />
           </div>

           <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                <BookOpen size={24} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Question Details</h2>
           </div>

           <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   Title <span className="text-rose-500">*</span>
                </label>
                <input className="field-input py-4 px-6 bg-slate-950/50 border-slate-700 focus:border-purple-500 text-lg font-bold placeholder:text-slate-700" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Reverse Linked List" />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   Description <span className="text-rose-500">*</span>
                </label>
                <textarea className="field-input min-h-[180px] py-4 px-6 bg-slate-950/50 border-slate-700 focus:border-purple-500 leading-relaxed Custom-scrollbar" required value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the problem, including input/output expectations and examples..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Difficulty</label>
                  <div className="relative group/select">
                    <select className="field-input py-3 px-4 bg-slate-950/50 border-slate-700 focus:border-purple-500 appearance-none cursor-pointer" value={form.difficulty}
                      onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                       <PlusCircle size={14} className="rotate-45" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Points</label>
                  <input className="field-input py-3 px-4 bg-slate-950/50 border-slate-700 focus:border-purple-500 font-bold" type="number" min="1" value={form.marks}
                    onChange={e => setForm({ ...form, marks: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Expected Complexity</label>
                  <input className="field-input py-3 px-4 bg-slate-950/50 border-slate-700 focus:border-purple-500 font-mono text-slate-300" placeholder="e.g. O(N log N)" value={form.expectedTimeComplexity}
                    onChange={e => setForm({ ...form, expectedTimeComplexity: e.target.value })} />
                </div>
              </div>
 
              {/* Visibility Section for Teachers */}
              {useAuthStore.getState().user?.role === 'TEACHER' && (
                <div className="pt-8 border-t border-slate-800/50">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    Visibility Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, visibility: 'PRIVATE' })}
                      className={`flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 ${
                        form.visibility === 'PRIVATE'
                          ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                          : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl ${form.visibility === 'PRIVATE' ? 'bg-purple-600 text-white' : 'bg-slate-800'}`}>
                        <EyeOff size={20} />
                      </div>
                      <div className="text-left">
                        <p className={`font-black text-sm uppercase tracking-tight ${form.visibility === 'PRIVATE' ? 'text-white' : 'text-slate-400'}`}>Private Access</p>
                        <p className="text-[10px] opacity-60 font-medium">Only you can view/use this question.</p>
                      </div>
                    </button>
 
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, visibility: 'GLOBAL' })}
                      className={`flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 ${
                        form.visibility === 'GLOBAL'
                          ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl ${form.visibility === 'GLOBAL' ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}>
                        <Globe size={20} />
                      </div>
                      <div className="text-left">
                        <p className={`font-black text-sm uppercase tracking-tight ${form.visibility === 'GLOBAL' ? 'text-white' : 'text-slate-400'}`}>Open Library</p>
                        <p className="text-[10px] opacity-60 font-medium">Available to all teachers globally.</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* Technical Specs Section */}
        <div className="glass-card p-8 border border-slate-700/50 shadow-2xl relative bg-slate-900/40">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <Info size={24} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Format & Constraints</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Input Format</label>
                <textarea className="field-input min-h-[100px] py-3 px-4 bg-slate-950/50 border-slate-700 focus:border-purple-500 text-sm italic" placeholder="Describe the input format..."
                  value={form.inputFormat} onChange={e => setForm({ ...form, inputFormat: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Output Format</label>
                <textarea className="field-input min-h-[100px] py-3 px-4 bg-slate-950/50 border-slate-700 focus:border-purple-500 text-sm italic" placeholder="Describe the output format..."
                  value={form.outputFormat} onChange={e => setForm({ ...form, outputFormat: e.target.value })} />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Constraints</label>
              <textarea className="field-input py-3 px-4 bg-slate-950/50 border-slate-700 focus:border-purple-500 font-mono text-xs text-blue-300" placeholder="e.g. 1 ≤ N ≤ 10^5"
                value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })} />
           </div>
        </div>

        {/* Code Scaffolding Section */}
        <div className="glass-card p-8 border border-slate-700/50 shadow-2xl relative bg-slate-950/40 overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Code size={120} className="text-emerald-400" />
           </div>

           <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <Code size={24} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Code Setup</h2>
           </div>
           <p className="text-sm text-slate-500 mb-8 font-medium">Provide the starter code and hidden wrapper code.</p>

           <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Starter Code</label>
                  <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500/60 uppercase tracking-widest animate-pulse">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Syntax Highlighting Active
                  </div>
                </div>
                <textarea className="field-input min-h-[180px] p-4 font-mono text-sm bg-slate-950 border-slate-800 focus:border-emerald-500/50 shadow-2xl custom-scrollbar" 
                  placeholder="/* START_EDITABLE */\npublic class Solution {\n    // Implementation here\n}\n/* END_EDITABLE */"
                  value={form.templateCode} onChange={e => setForm({ ...form, templateCode: e.target.value })} />
              </div>               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 text-rose-400/70">
                     <Settings size={12} /> Hidden Prefix Code
                  </label>
                  <textarea className="field-input min-h-[120px] p-4 font-mono text-xs bg-slate-950/80 border-slate-800 focus:border-rose-500/30 text-rose-100/60" 
                    placeholder="Imports, Class Header..."
                    value={form.prefixCode} onChange={e => setForm({ ...form, prefixCode: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 text-amber-400/70">
                     <Settings size={12} /> Hidden Suffix Code
                  </label>
                  <textarea className="field-input min-h-[120px] p-4 font-mono text-xs bg-slate-950/80 border-slate-800 focus:border-amber-500/30 text-amber-100/60" 
                    placeholder="Closing Scope, Drivers..."
                    value={form.suffixCode} onChange={e => setForm({ ...form, suffixCode: e.target.value })} />
                </div>
              </div>
           </div>
        </div>

        {/* Validation Matrix Section */}
        <div className="glass-card p-8 border border-slate-700/50 shadow-2xl relative bg-slate-900/40">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                  <Beaker size={24} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Test Cases</h2>
              </div>
              <button type="button" onClick={addTestCase}
                className="btn-secondary px-6 py-2.5 text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-slate-950/50 hover:bg-amber-500 hover:text-white transition-all ring-1 ring-white/5">
                <PlusCircle size={14} /> Add Test Case
              </button>
           </div>

           <div className="space-y-6">
              {testCases.map((tc, i) => (
                <div key={i} className="bg-slate-950/40 rounded-3xl p-6 space-y-6 border border-slate-800/80 hover:border-amber-500/20 transition-all group/case">
                  <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                         {i + 1}
                      </span>
                      <span className="text-white font-black text-xs uppercase tracking-widest opacity-60 group-hover/case:opacity-100 transition-opacity">Test Case</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" checked={tc.isHidden}
                          onChange={e => updateTestCase(i, 'isHidden', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500/20" />
                        Hidden
                      </label>
                      {testCases.length > 1 && (
                        <button type="button" onClick={() => removeTestCase(i)} className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Input</label>
                       <textarea className="field-input min-h-[100px] p-4 bg-slate-950/80 border-slate-800 focus:border-blue-500/30 text-xs font-mono text-blue-100/80 shadow-inner" value={tc.input}
                        onChange={e => updateTestCase(i, 'input', e.target.value)} placeholder="0.0.0.0" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Expected Output</label>
                       <textarea className="field-input min-h-[100px] p-4 bg-slate-950/80 border-slate-800 focus:border-emerald-500/30 text-xs font-mono text-emerald-100/80 shadow-inner" value={tc.expectedOutput}
                        onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)} placeholder="ACK" />
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Global Control Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-3xl border-t border-slate-800/50 z-50 animate-in slide-in-from-bottom-full duration-1000">
           <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
              <div className="hidden md:flex items-center gap-3 text-slate-500">
                 <HelpCircle size={18} />
                 <p className="text-xs font-medium">Fields with <span className="text-rose-500">*</span> are essential for deployment.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button type="button" onClick={() => navigate('/teacher/questions')} className="btn-secondary px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap">
                   Cancel Changes
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 md:flex-none px-10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.03] transition-all disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin text-white" /> : <Save size={16} />}
                  {loading ? 'Saving...' : id ? 'Update Question' : 'Save Question'}
                </button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
