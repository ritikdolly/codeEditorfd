import { useState } from 'react';
import { teacherService } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

const emptyTestCase = { input: '', expectedOutput: '', isHidden: false };

export function CreateQuestion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    expectedTimeComplexity: '',
    marks: 10,
    inputFormat: '',
    outputFormat: '',
    constraints: '',
  });
  const [testCases, setTestCases] = useState([{ ...emptyTestCase }]);

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
      await teacherService.createQuestion({ ...form, testCases });
      toast.success('Question created successfully!');
      navigate('/teacher');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Question</h1>
        <p className="text-slate-400 mt-1">Add a new coding problem to your question bank</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-3">Problem Details</h2>

          <div>
            <label className="field-label">Title *</label>
            <input className="field-input" required value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Two Sum" />
          </div>

          <div>
            <label className="field-label">Problem Description *</label>
            <textarea className="field-input min-h-[120px]" required value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the problem clearly..." />
          </div>

          <div className="grid grid-cols-3 gap-4 grid-cols-3-resp">
            <div>
              <label className="field-label">Difficulty</label>
              <select className="field-input" value={form.difficulty}
                onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="field-label">Marks</label>
              <input className="field-input" type="number" min="1" value={form.marks}
                onChange={e => setForm({ ...form, marks: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="field-label">Time Complexity</label>
              <input className="field-input" placeholder="e.g. O(n)" value={form.expectedTimeComplexity}
                onChange={e => setForm({ ...form, expectedTimeComplexity: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 grid-cols-2-resp">
            <div>
              <label className="field-label">Input Format</label>
              <textarea className="field-input min-h-[80px]" placeholder="Describe input format..."
                value={form.inputFormat} onChange={e => setForm({ ...form, inputFormat: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Output Format</label>
              <textarea className="field-input min-h-[80px]" placeholder="Describe output format..."
                value={form.outputFormat} onChange={e => setForm({ ...form, outputFormat: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="field-label">Constraints</label>
            <textarea className="field-input" placeholder="e.g. 1 ≤ n ≤ 10^5"
              value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })} />
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <h2 className="text-lg font-semibold text-white">Test Cases</h2>
            <button type="button" onClick={addTestCase}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300">
              <PlusCircle size={16} /> Add Test Case
            </button>
          </div>

          {testCases.map((tc, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium text-sm">Test Case {i + 1}</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                    <input type="checkbox" checked={tc.isHidden}
                      onChange={e => updateTestCase(i, 'isHidden', e.target.checked)}
                      className="rounded" />
                    Hidden
                  </label>
                  {testCases.length > 1 && (
                    <button type="button" onClick={() => removeTestCase(i)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 grid-cols-2-resp">
                <div>
                  <label className="field-label">Input</label>
                  <textarea className="field-input min-h-[80px] font-mono text-sm" value={tc.input}
                    onChange={e => updateTestCase(i, 'input', e.target.value)} placeholder="5&#10;1 2 3 4 5" />
                </div>
                <div>
                  <label className="field-label">Expected Output</label>
                  <textarea className="field-input min-h-[80px] font-mono text-sm" value={tc.expectedOutput}
                    onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)} placeholder="15" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading}
            className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving...' : 'Create Question'}
          </button>
          <button type="button" onClick={() => navigate('/teacher')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
