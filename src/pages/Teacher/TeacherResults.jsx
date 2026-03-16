import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherService } from '../../services/api';
import { BarChart2, BookOpen, Clock, Users, ArrowRight, ClipboardList, Calendar, CheckCircle, Play, AlertCircle } from 'lucide-react';

export function TeacherResults() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherService.getTests()
      .then(setTests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/20 ring-1 ring-white/20">
            <BarChart2 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Analytics Hub</h1>
            <p className="text-slate-400 font-medium max-w-md">Select a test to deep-dive into student insights and performance metrics.</p>
          </div>
        </div>
        <Link to="/teacher/tests/create" className="btn-primary flex items-center gap-2 group whitespace-nowrap self-start md:self-center">
           <ClipboardList size={18} />
           <span>Schedule New Test</span>
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center border-dashed border-slate-700/50 group hover:border-purple-500/30 transition-colors">
          <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 ring-1 ring-slate-700/50 group-hover:ring-purple-500/20 transition-all">
            <BookOpen size={40} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">No Tests Found</h3>
          <p className="text-slate-400 mb-8 max-w-sm leading-relaxed font-medium">
            Your assessment history is empty. Launch a new test to start collecting student performance data.
          </p>
          <Link to="/teacher/tests/create" className="btn-primary px-8 py-3 rounded-2xl shadow-2xl">
            Create First Test
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map(test => (
            <div key={test.id} className="glass-card p-6 flex flex-col hover:border-purple-500/40 transition-all duration-500 group relative overflow-hidden h-[300px]">
              {/* Background Glow */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 blur-[60px] group-hover:bg-purple-500/20 transition-all duration-500`}></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all">
                   <Calendar size={20} className="text-slate-400 group-hover:text-purple-400" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  test.status === 'ACTIVE' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white' 
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white'
                }`}>
                  {test.status || 'SCHEDULED'}
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="text-xl font-black text-white truncate mb-2 group-hover:text-purple-300 transition-colors" title={test.name}>{test.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-wider gap-2">
                    <Clock size={14} className="text-slate-500" />
                    <span>Duration: <span className="text-slate-200">{test.duration} Minutes</span></span>
                  </div>
                  {test.startTime ? (
                    <div className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-wider gap-2">
                      <Play size={14} className="text-slate-500" />
                      <span>Starts: <span className="text-slate-200">{new Date(test.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {new Date(test.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span></span>
                    </div>
                  ) : (
                     <div className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-wider gap-2 opacity-50">
                        <AlertCircle size={14} />
                        <span>Date Not Set</span>
                     </div>
                  )}
                </div>
              </div>
              
              <Link 
                to={`/teacher/tests/${test.id}`}
                className="mt-6 w-full py-4 rounded-2xl bg-slate-800/80 hover:bg-purple-600 border border-slate-700/50 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-600/20 text-white text-[11px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 group-hover:translate-y-[-4px] relative z-10"
              >
                <span>Analytics Console</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
