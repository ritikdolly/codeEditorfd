import { useEffect, useState } from 'react';
import { teacherService } from '../../services/api';
import { BookOpen, Plus, Search, Filter, HelpCircle, ArrowLeft, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function QuestionLibrary() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await teacherService.getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyColor = { 
    EASY: 'text-green-600 bg-green-50 border-green-100', 
    MEDIUM: 'text-yellow-600 bg-yellow-50 border-yellow-100', 
    HARD: 'text-red-600 bg-red-50 border-red-100' 
  };

  const filteredQuestions = (questions || []).filter(q => {
    const title = q.title || '';
    const description = q.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header section with back button and CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all border border-transparent shadow-sm hover:border-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Question Library</h1>
            <p className="text-gray-500 mt-1 text-[15px]">Browse and manage your coding challenges.</p>
          </div>
        </div>
        <Link 
          to="/teacher/questions/create" 
          className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md active:scale-95"
        >
          <Plus size={20} /> New Question
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-lg py-2.5 pl-11 pr-4 focus:ring-1 focus:ring-black transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select 
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-gray-50 border-none rounded-lg py-2.5 px-4 focus:ring-1 focus:ring-black text-sm font-bold cursor-pointer w-full md:w-44"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100"></div>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white border border-gray-100 border-dashed rounded-3xl p-24 flex flex-col items-center justify-center text-center">
          <div className="p-5 bg-gray-50 rounded-full mb-6">
            <BookOpen className="text-gray-300" size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No matching questions</h3>
          <p className="text-gray-500 mt-2 max-w-sm">Adjust your filters or start creating some new challenges for your students.</p>
          <button 
            onClick={() => { setSearchTerm(''); setFilterDifficulty('ALL'); }}
            className="mt-8 text-black font-bold text-sm bg-gray-50 hover:bg-gray-100 px-6 py-2.5 rounded-lg transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map(q => (
            <div key={q.id} className="group bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-6 transition-all hover:shadow-lg relative flex flex-col justify-between overflow-hidden">
               {/* Accent line on hover */}
               <div className="absolute top-0 left-0 w-full h-1 bg-[#2df07b] opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${difficultyColor[q.difficulty] || 'text-gray-500 border-gray-100'}`}>
                    {q.difficulty}
                  </span>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200">
                      <Edit2 size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">
                  {q.title}
                </h3>
                <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 mb-6 h-10">
                  {q.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-2">
                <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-[#2df07b]" />
                    {q.marks} Pts
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                  <span>{q.expectedTimeComplexity || 'O(n)'}</span>
                </div>
                <MoreVertical size={16} className="text-gray-400 cursor-pointer lg:opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
