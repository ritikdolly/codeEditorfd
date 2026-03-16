import { useEffect, useState } from 'react';
import { teacherService } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Loader2, CheckSquare, Square, Calendar, Settings, ListChecks, ArrowLeft, Info } from 'lucide-react';

export function CreateTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({ name: '', duration: 60, startTime: '', endTime: '' });

  useEffect(() => {
    teacherService.getQuestions().then(setQuestions).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.startTime && form.duration) {
      const start = new Date(form.startTime);
      const end = new Date(start.getTime() + parseInt(form.duration) * 60000);
      
      // Calculate local ISO string for datetime-local input
      const tzOffset = end.getTimezoneOffset() * 60000;
      const localEnd = new Date(end.getTime() - tzOffset).toISOString().slice(0, 16);
      
      setForm(prev => ({ ...prev, endTime: localEnd }));
    }
  }, [form.startTime, form.duration]);

  const toggleQuestion = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error('Please select at least one question');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        duration: parseInt(form.duration),
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        questionIds: selectedIds,
      };
      const created = await teacherService.createTest(payload);
      toast.success('Test created! Share the QR code with your students.');
      navigate(`/teacher/tests/${created.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = { EASY: 'text-green-400', MEDIUM: 'text-yellow-400', HARD: 'text-red-400' };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button onClick={() => navigate('/teacher')} className="flex items-center gap-2 text-slate-500 hover:text-purple-400 font-bold text-xs uppercase tracking-widest transition-colors mb-4 group">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-white tracking-tight">Schedule New Test</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Configure rules, timing, and select questions for your assessment.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Section */}
          <div className="glass-card p-6 border border-slate-700/50 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Settings size={100} className="text-purple-400" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                 <Settings size={20} className="text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Exam Protocol</h2>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Test Title *</label>
                <input className="field-input py-3 px-4 bg-slate-900/50 border-slate-700 focus:border-purple-500 shadow-inner" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures & Algorithms 01" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Duration (Min)</label>
                  <input className="field-input py-3 px-4 bg-slate-900/50 border-slate-700 focus:border-purple-500 text-center" type="number" min="5" max="300" value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-700/30">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                   <Calendar size={14} className="text-purple-400" /> Scheduling Window
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1 block">Window Open (Start)</label>
                    <input className="field-input py-2.5 px-4 bg-slate-900/50 border-slate-700 text-xs font-mono" type="datetime-local" value={form.startTime}
                      onChange={e => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                  <div className="opacity-60 grayscale hover:grayscale-0 transition-all">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1 block">Window Close (Auto-calculated)</label>
                    <input className="field-input py-2.5 px-4 bg-slate-900/50 border-slate-700 text-xs font-mono bg-slate-800/20" type="datetime-local" value={form.endTime} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Selector Section */}
          <div className="glass-card p-6 border border-slate-700/50 flex flex-col h-full bg-slate-950/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <ListChecks size={20} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Question Bank</h2>
              </div>
              <div className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700">
                {selectedIds.length} Selected
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-800 rounded-3xl group hover:border-purple-500/20 transition-all">
                <div className="p-4 bg-slate-800/50 rounded-full mb-4 group-hover:bg-purple-500/10 transition-all">
                   <Info size={30} className="text-slate-600 group-hover:text-purple-400" />
                </div>
                <p className="text-slate-500 font-medium text-center mb-6">Your question bank is currently empty.</p>
                <button type="button" onClick={() => navigate('/teacher/questions/create')}
                  className="btn-secondary text-xs uppercase tracking-widest font-black py-2.5 hover:bg-purple-600 hover:text-white transition-all">
                  Load New Assets
                </button>
              </div>
            ) : (
              <div className="flex-1 space-y-3 pr-2 custom-scrollbar overflow-y-auto max-h-[480px]">
                {questions.map(q => {
                  const selected = selectedIds.includes(q.id);
                  return (
                    <div key={q.id} onClick={() => toggleQuestion(q.id)}
                      className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                        selected 
                          ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.05)]' 
                          : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-800/40'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        selected ? 'bg-purple-500 text-white animate-in zoom-in-75 duration-300' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
                      }`}>
                        {selected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm transition-colors ${selected ? 'text-purple-300' : 'text-slate-300 group-hover:text-white'}`}>{q.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter italic">{q.marks} Pts</span>
                          <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${difficultyColor[q.difficulty]}`}>{q.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700/50 mt-10">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin text-white" /> : <PlusCircle size={18} />}
            {loading ? 'Finalizing Configuration...' : 'Launch Assessment & Deploy'}
          </button>
          <button type="button" onClick={() => navigate('/teacher')} className="btn-secondary px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all">
            Abandon
          </button>
        </div>
      </form>
    </div>
  );
}
