import { useEffect, useState } from 'react';
import { teacherService } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Loader2, CheckSquare, Square } from 'lucide-react';

export function CreateTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({ name: '', duration: 60, startTime: '', endTime: '' });

  useEffect(() => {
    teacherService.getQuestions().then(setQuestions).catch(console.error);
  }, []);

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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Test</h1>
        <p className="text-slate-400 mt-1">Set up a coding exam for your students</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-3">Test Settings</h2>

          <div>
            <label className="field-label">Test Name *</label>
            <input className="field-input" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Arrays Midterm Exam" />
          </div>

          <div>
            <label className="field-label">Duration (minutes)</label>
            <input className="field-input" type="number" min="5" max="300" value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4 grid-cols-2-resp">
            <div>
              <label className="field-label">Start Time (optional)</label>
              <input className="field-input" type="datetime-local" value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label className="field-label">End Time (optional)</label>
              <input className="field-input" type="datetime-local" value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <h2 className="text-lg font-semibold text-white">Select Questions</h2>
            <span className="text-sm text-slate-400">{selectedIds.length} selected</span>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No questions available.{' '}
              <button type="button" onClick={() => navigate('/teacher/questions/create')}
                className="text-purple-400 hover:text-purple-300">Create one first</button>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map(q => {
                const selected = selectedIds.includes(q.id);
                return (
                  <div key={q.id} onClick={() => toggleQuestion(q.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${selected ? 'border-purple-500/50 bg-purple-500/10' : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'}`}>
                    {selected ? <CheckSquare size={18} className="text-purple-400 shrink-0" /> : <Square size={18} className="text-slate-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{q.title}</p>
                      <p className="text-slate-400 text-sm">{q.marks} marks</p>
                    </div>
                    <span className={`text-sm font-medium ${difficultyColor[q.difficulty]}`}>{q.difficulty}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Creating...' : 'Create Test & Get QR Code'}
          </button>
          <button type="button" onClick={() => navigate('/teacher')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
