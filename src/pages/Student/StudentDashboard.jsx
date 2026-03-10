import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [testId, setTestId] = useState('');
  const [loading, setLoading] = useState(false);

  const joinTest = async (e) => {
    e.preventDefault();
    if (!testId.trim()) return;
    setLoading(true);
    try {
      // Extract UUID if user pastes a full URL
      let parsedId = testId.trim();
      const uuidMatch = parsedId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (uuidMatch) {
        parsedId = uuidMatch[0];
      }

      await studentService.getTest(parsedId);
      navigate(`/student/test/${parsedId}`);
    } catch (err) {
      toast.error('Test not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-8"
      style={{ background: 'var(--bg-gradient)' }}>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Hello, {user?.name}! 👋</h1>
        <p className="text-slate-400 mt-2">Enter a test ID or scan a QR code to join an exam</p>
      </div>

      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-2xl bg-purple-600/20">
            <BookOpen size={32} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Join a Test</h2>
        </div>

        <form onSubmit={joinTest} className="space-y-4">
          <div>
            <label className="field-label">Test ID</label>
            <input className="field-input" value={testId} onChange={e => setTestId(e.target.value)}
              placeholder="Paste test ID here..." required />
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? 'Checking...' : <>Join Test <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
