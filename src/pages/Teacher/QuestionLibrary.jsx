import { useEffect, useState } from "react";
import { teacherService } from "../../services/api";
import { BookOpen, Plus, Search, Filter, HelpCircle, ArrowLeft, MoreVertical, Edit2, Trash2, Zap, ArrowUpRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function QuestionLibrary() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("ALL");
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
      console.error("Failed to load questions:", error);
      toast.error("Cloud synchronization failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent deletion cannot be undone. Proceed?")) return;
    try {
      await teacherService.deleteQuestion(id);
      toast.success("Item purged from repository.");
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      toast.error("Failed to delete asset.");
    }
  };

  const difficultyColor = {
    EASY: "text-accent bg-accent/5 border-accent/10",
    MEDIUM: "text-amber-500 bg-amber-500/5 border-amber-500/10",
    HARD: "text-rose-500 bg-rose-500/5 border-rose-500/10",
  };

  const filteredQuestions = (questions || []).filter((q) => {
    const title = q.title || "";
    const description = q.description || "";
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterDifficulty === "ALL" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-fade-in pb-20 relative z-10">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/teacher")}
            className="p-3 border border-white/10 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-xl group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-2 text-accent">
               <BookOpen size={14} />
               <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Asset Repository</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight uppercase">Question Archive</h1>
            <p className="text-gray-400 mt-2 text-[15px] font-medium">Manage your high-precision coding challenges bank.</p>
          </div>
        </div>
        <Link
          to="/teacher/questions/create"
          className="flex items-center justify-center gap-3 bg-accent hover:bg-accent-dark text-black font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-accent/10 active:scale-95 uppercase tracking-widest text-[12px]"
        >
          <Plus size={18} strokeWidth={3} /> Authorize New Item
        </Link>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col md:flex-row gap-6 items-center bg-[#111111] p-5 rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search vectors by title or context..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl py-3 pl-12 pr-6 focus:outline-none focus:border-accent transition-all text-sm font-bold shadow-xl placeholder:text-gray-700 text-white"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border border-white/5 rounded-xl shadow-xl w-full md:w-48 relative">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-[11px] font-bold uppercase tracking-widest cursor-pointer w-full text-white appearance-none"
            >
              <option value="ALL" className="bg-[#111111]">ALL INTENSITY</option>
              <option value="EASY" className="bg-[#111111]">EASY</option>
              <option value="MEDIUM" className="bg-[#111111]">MEDIUM</option>
              <option value="HARD" className="bg-[#111111]">HARD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Stream */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-70 bg-[#111111] border border-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 border-dashed rounded-[40px] p-24 flex flex-col items-center justify-center text-center shadow-2xl">
          <div className="p-6 bg-white/5 rounded-3xl mb-8">
            <BookOpen className="text-gray-600" size={64} strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Zero Matches Found</h3>
          <p className="text-gray-500 mt-4 max-w-sm font-medium">No vectors in the current context. Adjust your constraints.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterDifficulty("ALL");
            }}
            className="mt-10 text-white font-bold text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3.5 rounded-xl transition-all uppercase tracking-widest active:scale-95"
          >
            Clear Constraints
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="group bg-[#111111] border border-white/10 hover:border-accent/30 rounded-4xl p-8 transition-all hover:shadow-2xl relative flex flex-col justify-between overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] text-white transition-opacity pointer-events-none">
                 <Zap size={160} />
              </div>

              <div>
                <div className="flex justify-between items-start mb-6">
                  <span
                    className={`text-[9px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest ${difficultyColor[q.difficulty] || "text-gray-500 border-white/5"}`}
                  >
                    {q.difficulty}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => navigate(`/teacher/questions/edit/${q.id}`)}
                      className="p-2.5 bg-white text-black rounded-xl shadow-xl hover:bg-gray-200 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="p-2.5 bg-rose-600/10 text-rose-500 rounded-xl shadow-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-tight mb-4 line-clamp-1 uppercase">
                  {q.title}
                </h3>
                <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-3 mb-8 h-15 font-medium">
                  {q.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                <div className="flex items-center gap-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <HelpCircle size={15} className="text-accent" />
                    {q.marks} Pts
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/10"></div>
                  <span className="flex items-center gap-2">
                    <Zap size={15} className="text-amber-500" />
                    {q.expectedTimeComplexity || "O(n)"}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-all cursor-pointer bg-white/5 shadow-xl">
                   <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

