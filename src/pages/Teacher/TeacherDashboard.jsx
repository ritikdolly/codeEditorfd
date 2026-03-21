import { useEffect, useState } from 'react';
import { teacherService } from '../../services/api';
import { PlusCircle, ClipboardList, BookOpen, HelpCircle, ArrowRight, Activity, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export function TeacherDashboard() {
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    teacherService.getQuestions().then(setQuestions).catch(console.error);
    teacherService.getTests()
      .then(data => {
        const sortedTests = [...data].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setTests(sortedTests);
      })
      .catch(console.error);
  }, []);

  const difficultyColor = { EASY: 'text-green-400', MEDIUM: 'text-yellow-400', HARD: 'text-red-400' };

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{user?.name}</span> 👋
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Manage your elite coding assessments and questions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/teacher/questions/create" className="btn-primary flex items-center gap-2 group whitespace-nowrap">
            <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>New Question</span>
          </Link>
          <Link to="/teacher/tests/create" className="btn-secondary flex items-center gap-2 group whitespace-nowrap">
            <Calendar size={18} className="text-purple-400" />
            <span>Schedule Test</span>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {(() => {
          const now = Date.now();
          const upcomingTests = tests.filter(t => t.startTime && new Date(t.startTime).getTime() > now);
          upcomingTests.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          
          const nextSessionVal = upcomingTests.length > 0 
            ? new Date(upcomingTests[0].startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
            : 'None';
          const nextSessionDesc = upcomingTests.length > 0
            ? upcomingTests[0].name
            : 'No upcoming tests';

          return [
            { label: 'Total Questions', val: questions.length, icon: HelpCircle, color: 'purple', desc: 'Active bank' },
            { label: 'Tests Conducted', val: tests.length, icon: ClipboardList, color: 'blue', desc: 'Lifetime count' },
            { label: 'Next Session', val: nextSessionVal, icon: Activity, color: 'emerald', desc: nextSessionDesc }
          ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 relative group overflow-hidden">
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity p-4`}>
              <stat.icon size={120} className={`text-${stat.color}-400`} />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 shadow-lg shadow-${stat.color}-500/5`}>
                <stat.icon size={24} className={`text-${stat.color}-400`} />
              </div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</span>
            </div>
            <div>
              <p className="text-4xl font-black text-white">{stat.val}</p>
              <p className="text-slate-500 text-xs mt-1 font-medium italic">{stat.desc}</p>
            </div>
          </div>
          ));
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400"><BookOpen size={20} /></span>
              Recent Questions
            </h2>
            <Link to="/teacher/questions" className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest flex items-center gap-2 group">
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {questions.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-slate-700">
               <HelpCircle size={40} className="mx-auto text-slate-700 mb-4" />
               <p className="text-slate-500 font-medium">No questions yet. Your bank is empty.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {questions.slice(0, 4).map(q => (
                <div key={q.id} className="glass-card p-4 border border-slate-700/50 hover:bg-slate-800/20 hover:translate-x-1 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center font-bold text-slate-500 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                       {q.title.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-purple-300 transition-colors truncate max-w-[200px]">{q.title}</p>
                      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-tight mt-0.5">{q.marks} Marks · {q.expectedTimeComplexity || 'O(N)'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${difficultyColor[q.difficulty] || 'text-slate-400'} bg-slate-900/50 border border-slate-800`}>
                    {q.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tests Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400"><ClipboardList size={20} /></span>
              Active Tests
            </h2>
            <Link to="/teacher/results" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center gap-2 group">
              Manage results <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {tests.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-slate-700">
               <Award size={40} className="mx-auto text-slate-700 mb-4" />
               <p className="text-slate-500 font-medium">No tests created yet. Scale your impact!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tests.slice(0, 4).map(t => (
                <div key={t.id} className="glass-card p-5 border border-slate-700/50 hover:bg-slate-800/30 hover:shadow-2xl hover:shadow-purple-500/5 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-white text-lg group-hover:text-purple-300 transition-colors">{t.name}</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 italic">{t.duration} Minutes Duration</p>
                    </div>
                    <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                       <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{t.status}</span>
                    </div>
                  </div>
                  <Link to={`/teacher/tests/${t.id}`} className="w-full py-2 bg-slate-800/50 hover:bg-purple-600 border border-slate-700 group-hover:border-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2">
                    Open Control Center <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
