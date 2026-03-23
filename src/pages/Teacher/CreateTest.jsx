import { useEffect, useState } from "react";
import { teacherService } from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Loader2, CheckSquare, Square, ChevronLeft, Calendar, Clock, BookOpen, ShieldCheck, Zap } from "lucide-react";

export function CreateTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({
    name: "",
    duration: 60,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    teacherService.getQuestions().then(setQuestions).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.startTime && form.duration) {
      const start = new Date(form.startTime);
      const end = new Date(start.getTime() + parseInt(form.duration) * 60000);

      // Calculate local ISO string for datetime-local input
      const tzOffset = end.getTimezoneOffset() * 60000;
      const localEnd = new Date(end.getTime() - tzOffset)
        .toISOString()
        .slice(0, 16);

      setForm((prev) => ({ ...prev, endTime: localEnd }));
    }
  }, [form.startTime, form.duration]);

  const toggleQuestion = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error("Cluster empty. Select at least one source vector.");
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
      toast.success("Protocol successfully initialized.");
      navigate(`/teacher/tests/${created.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initialize protocol");
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = {
    EASY: "text-[#2df07b] bg-[#2df07b]/5 border-[#2df07b]/20",
    MEDIUM: "text-amber-500 bg-amber-500/5 border-amber-500/20",
    HARD: "text-rose-500 bg-rose-500/5 border-rose-500/20",
  };

  return (
    <div className="animate-fade-in pb-20 relative z-10">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="flex items-center gap-5">
             <button 
                onClick={() => navigate('/teacher')}
                className="p-3 border border-white/10 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-xl group"
             >
                <ChevronLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
             </button>
             <div>
                <div className="flex items-center gap-2 mb-2 text-[#2df07b]">
                   <ShieldCheck size={14} />
                   <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Protocol Sequence</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight uppercase">Schedule Assessment</h1>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Section 1: Test Logistics */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden group">
             <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Calendar size={18} className="text-[#2df07b]" />
                   <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">Protocol Configuration</h2>
                </div>
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Phase 01</div>
             </div>
             
             <div className="p-8 space-y-10">
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Assessment Designation *</label>
                  <input
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-[#2df07b] transition-all placeholder:text-gray-700 font-bold shadow-xl"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Data Structures & Algorithms 01"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-white/5">
                  <div className="space-y-3">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Clock size={14} /> Duration (min)
                    </label>
                    <input
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-[#2df07b] font-bold shadow-xl"
                      type="number"
                      min="5"
                      max="300"
                      value={form.duration || 60}
                      onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Window Activation</label>
                    <input
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-[#2df07b] font-bold shadow-xl appearance-none"
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 opacity-50">Window Termination</label>
                    <input
                      className="w-full bg-[#050505] border border-white/5 rounded-xl text-gray-700 px-5 py-3.5 font-bold shadow-xl opacity-50 cursor-not-allowed"
                      type="datetime-local"
                      value={form.endTime}
                      readOnly
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Section 2: Question Repository Selection */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden group">
             <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <BookOpen size={18} className="text-[#2df07b]" />
                   <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">Source Bank</h2>
                </div>
                <span className="text-[10px] font-bold text-[#2df07b] bg-white/5 px-4 py-2 rounded-xl border border-[#2df07b]/20 uppercase tracking-widest">
                  {selectedIds.length} Vectors Matched
                </span>
             </div>
             
             <div className="p-8">
                {questions.length === 0 ? (
                  <div className="p-16 bg-white/[0.01] border border-white/5 border-dashed rounded-[32px] flex flex-col items-center justify-center text-center shadow-2xl">
                    <BookOpen size={48} className="text-gray-700 mb-6" strokeWidth={1} />
                    <p className="text-gray-500 text-sm font-medium">Your question bank is currently empty.</p>
                    <button
                      type="button"
                      onClick={() => navigate("/teacher/questions/create")}
                      className="mt-8 text-[#2df07b] font-bold text-[11px] uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Authorize New Source
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[540px] overflow-y-auto custom-scrollbar pr-3">
                    {questions.map((q) => {
                      const selected = selectedIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestion(q.id)}
                          className={`p-6 rounded-2xl border transition-all flex items-center gap-5 cursor-pointer group/item ${
                            selected
                              ? "border-[#2df07b]/50 bg-[#2df07b]/5 shadow-[0_0_20px_rgba(45,240,123,0.05)]"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="shrink-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                               selected 
                               ? "bg-[#2df07b] text-black shadow-[0_0_15px_rgba(45,240,123,0.3)]" 
                               : "bg-white/5 text-gray-600 border border-white/5 group-hover/item:border-white/10"
                            }`}>
                               {selected ? <CheckSquare size={20} strokeWidth={3} /> : <Square size={20} strokeWidth={2.5} />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-[16px] tracking-tight truncate mb-1 ${selected ? "text-[#2df07b]" : "text-white"}`}>
                              {q.title}
                            </p>
                            <div className={`flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest ${selected ? "text-[#2df07b]/60" : "text-gray-600"}`}>
                              <span>{q.marks} Pts</span>
                              <div className="w-1 h-1 rounded-full bg-white/10"></div>
                              <span>{q.expectedTimeComplexity || 'O(n)'}</span>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest shrink-0 ${difficultyColor[q.difficulty] || "text-gray-600 bg-white/5 border-white/5"}`}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
          </div>

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
            <button
               type="button"
               onClick={() => navigate("/teacher")}
               className="text-gray-600 font-bold text-[11px] uppercase tracking-widest hover:text-rose-500 transition-all px-8 py-3.5 bg-white/5 rounded-xl border border-white/5 active:scale-95"
            >
               Discard Protocol
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-4 px-12 rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[12px] shadow-[#2df07b]/10"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} strokeWidth={2.5} />}
              {loading ? "Transmitting..." : "Initialize & Deploy Protocol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

