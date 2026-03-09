import { useEffect, useState } from 'react';
import { teacherService } from '../../services/api';
import { PlusCircle, ClipboardList, BookOpen, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function TeacherDashboard() {
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    teacherService.getQuestions().then(setQuestions).catch(console.error);
    teacherService.getTests().then(setTests).catch(console.error);
  }, []);

  const difficultyColor = { EASY: 'text-green-400', MEDIUM: 'text-yellow-400', HARD: 'text-red-400' };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name} 👋</h1>
        <p className="text-slate-400 mt-1">Manage your questions and tests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle size={20} className="text-purple-400" />
            <span className="text-slate-300 font-medium">Questions</span>
          </div>
          <p className="text-3xl font-bold text-white">{questions.length}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList size={20} className="text-blue-400" />
            <span className="text-slate-300 font-medium">Tests Created</span>
          </div>
          <p className="text-3xl font-bold text-white">{tests.length}</p>
        </div>
        <div className="glass-card p-5 flex flex-col gap-2">
          <Link to="/teacher/questions/create" className="btn-primary text-center text-sm">+ New Question</Link>
          <Link to="/teacher/tests/create" className="btn-secondary text-center text-sm">+ New Test</Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">My Questions</h2>
        {questions.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500">No questions yet. Create your first one!</div>
        ) : (
          <div className="grid gap-3">
            {questions.map(q => (
              <div key={q.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{q.title}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{q.marks} marks · {q.expectedTimeComplexity || 'N/A'}</p>
                </div>
                <span className={`text-sm font-semibold ${difficultyColor[q.difficulty] || 'text-slate-400'}`}>
                  {q.difficulty}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">My Tests</h2>
        {tests.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500">No tests yet. Create your first exam!</div>
        ) : (
          <div className="grid gap-3">
            {tests.map(t => (
              <div key={t.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{t.name}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{t.duration} min · Status: <span className="text-purple-400">{t.status}</span></p>
                </div>
                <Link to={`/teacher/tests/${t.id}`} className="text-sm text-purple-400 hover:text-purple-300">View →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
