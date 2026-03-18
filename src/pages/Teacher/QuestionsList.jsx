import { useEffect, useState } from 'react';
import { teacherService } from '../../services/api';
import { PlusCircle, Search, Filter, Edit2, Trash2, BookOpen, Clock, Award, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function QuestionsList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getQuestions();
      setQuestions(data);
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;
    try {
      await teacherService.deleteQuestion(id);
      toast.success('Question deleted successfully');
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                         q.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || q.difficulty === filter;
    return matchesSearch && matchesFilter;
  });

  const difficultyColor = { 
    EASY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', 
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20', 
    HARD: 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <button onClick={() => navigate('/teacher')} className="flex items-center gap-2 text-slate-500 hover:text-purple-400 font-bold text-xs uppercase tracking-widest transition-colors mb-4 group">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
          </button>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Question <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Bank</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">View and manage your coding questions.</p>
        </div>
        <Link to="/teacher/questions/create" className="btn-primary flex items-center gap-2 group whitespace-nowrap">
          <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Create Question</span>
        </Link>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center animate-in fade-in duration-1000">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or description..." 
            className="field-input pl-12 py-3 bg-slate-900/40 border-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-slate-500" size={18} />
          <select 
            className="field-input py-3 bg-slate-900/40 border-slate-800 min-w-[150px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Levels</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-bold uppercase tracking-widest text-xs">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="glass-card p-20 text-center border-dashed border-slate-800">
            <BookOpen size={60} className="mx-auto text-slate-800 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No matching problems found</h3>
            <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredQuestions.map((q, i) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 border border-slate-800/50 hover:border-purple-500/30 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center font-black text-xl text-slate-600 group-hover:text-purple-400 group-hover:border-purple-500/20 transition-all shrink-0">
                    {q.title.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-white text-xl truncate group-hover:text-purple-300 transition-colors uppercase tracking-tight">{q.title}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border tracking-widest uppercase shrink-0 ${difficultyColor[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Award size={14} className="text-amber-500/50" />
                        <span>{q.marks} Pts</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-500/50" />
                        <span>{q.expectedTimeComplexity || 'O(N)'}</span>
                      </div>
                      <div className="hidden md:block truncate text-slate-600 font-medium italic">
                        {q.description.substring(0, 100)}...
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 relative z-10">
                  <button 
                    onClick={() => navigate(`/teacher/questions/edit/${q.id}`)}
                    className="flex-1 md:flex-none p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-purple-600 hover:border-purple-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    <span className="md:hidden text-xs font-black uppercase tracking-widest">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="flex-1 md:flex-none p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span className="md:hidden text-xs font-black uppercase tracking-widest">Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
