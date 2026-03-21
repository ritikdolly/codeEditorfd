import { useEffect, useState } from 'react';
import { teacherService } from '../../services/api';
import { PlusCircle, ClipboardList, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
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

  const difficultyColor = { 
    EASY: 'text-green-600 bg-green-50 border-green-100', 
    MEDIUM: 'text-yellow-600 bg-yellow-50 border-yellow-100', 
    HARD: 'text-red-600 bg-red-50 border-red-100' 
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 text-[15px]">Welcome back, {user?.name}. Manage your curriculum and student assessments.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link 
            to="/teacher/questions/create" 
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-5 rounded-lg transition-all flex items-center gap-2 text-sm shadow-sm active:scale-95"
          >
            <PlusCircle size={18} /> New Question
          </Link>
          <Link 
            to="/teacher/tests/create" 
            className="bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-lg transition-all flex items-center gap-2 text-sm shadow-md active:scale-95"
          >
            <PlusCircle size={18} /> Create Test
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Questions Stat Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex flex-col">
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4">Total Questions</span>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900 leading-none">{questions.length}</p>
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#2df07b] transition-colors">
                 <HelpCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Tests Stat Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex flex-col">
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4">Active Tests</span>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900 leading-none">{tests.length}</p>
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-blue-500 transition-colors">
                 <ClipboardList size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Placeholder (Modern look) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-2 flex items-center justify-between">
           <div className="space-y-1">
             <p className="text-sm font-bold text-gray-900">Assessment Readiness</p>
             <p className="text-xs text-gray-500">Your current test coverage is healthy.</p>
           </div>
           <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  {i}
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ─── Recent Questions ─── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Questions</h2>
            <Link to="/teacher/questions" className="text-xs text-[#2df07b] font-bold uppercase tracking-widest hover:underline">View Library</Link>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white border border-gray-100 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <BookOpen className="text-gray-300 mb-4" size={32} />
              <p className="text-gray-400 text-sm">Your library is empty. <br/> Start building your curriculum today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.slice(0, 5).map(q => (
                <div key={q.id} className="group bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 flex items-center justify-between transition-all shadow-sm">
                  <div className="min-w-0 pr-4">
                    <p className="font-bold text-gray-900 text-sm truncate">{q.title}</p>
                    <div className="flex items-center gap-3 text-gray-400 text-[11px] mt-1 font-bold uppercase tracking-widest">
                      <span>{q.marks} pts</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                      <span>{q.expectedTimeComplexity || 'O(n)'}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${difficultyColor[q.difficulty] || 'text-gray-500 bg-gray-50 border-gray-100'}`}>
                    {q.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Recent Assessments ─── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Assessments</h2>
            <Link to="/teacher/results" className="text-xs text-[#2df07b] font-bold uppercase tracking-widest hover:underline">View Results</Link>
          </div>

          {tests.length === 0 ? (
            <div className="bg-white border border-gray-100 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <ClipboardList className="text-gray-300 mb-4" size={32} />
              <p className="text-gray-400 text-sm">No active tests. <br/> Compile questions to create your first exam.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.slice(0, 5).map(t => (
                <div key={t.id} className="group bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 flex items-center justify-between transition-all shadow-sm">
                  <div className="min-w-0 pr-4">
                    <p className="font-bold text-gray-900 text-sm truncate">{t.name}</p>
                    <div className="flex items-center gap-3 text-gray-400 text-[11px] mt-1 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><ClipboardList size={12} /> {t.duration} min</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                      <span className="flex items-center gap-1.5 capitalize">{t.status.toLowerCase()}</span>
                    </div>
                  </div>
                  <Link 
                    to={`/teacher/tests/${t.id}`} 
                    className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                  >
                    <ArrowRight size={18} />
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