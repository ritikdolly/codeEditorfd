import { useEffect, useState } from "react";
import { teacherService } from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Loader2, CheckSquare, Square, ChevronLeft, Calendar, Clock, BookOpen } from "lucide-react";

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
      toast.error("Please select at least one question");
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
      toast.success("Test created successfully!");
      navigate(`/teacher/tests/${created.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = {
    EASY: "text-green-600 bg-green-50 border-green-100",
    MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-100",
    HARD: "text-red-600 bg-red-50 border-red-100",
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => navigate('/teacher')}
                className="p-2 border border-gray-100 bg-white rounded-lg text-gray-400 hover:text-black hover:border-gray-300 transition-all shadow-sm"
             >
                <ChevronLeft size={20} />
             </button>
             <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Assessment</h1>
                <p className="text-gray-500 mt-1 text-[15px]">Configure an exam and select the challenges for your students.</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Test Logistics */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Test Logistics</h2>
             </div>
             
             <div className="p-8 space-y-8">
                <div>
                  <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Test Name *</label>
                  <input
                    className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 font-bold"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Data Structures Finale"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                       <Clock size={14} /> Duration (min)
                    </label>
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black font-bold"
                      type="number"
                      min="5"
                      max="300"
                      value={form.duration || 60}
                      onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Window Start</label>
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black font-medium"
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Window End</label>
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-400 px-5 py-3 focus:ring-1 focus:ring-black font-medium opacity-70"
                      type="datetime-local"
                      value={form.endTime}
                      readOnly
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Section 2: Question Repository Selection */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <BookOpen size={18} className="text-gray-400" />
                   <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Question Repository</h2>
                </div>
                <span className="text-[11px] font-black text-[#2df07b] bg-zinc-900 px-4 py-1.5 rounded-lg uppercase tracking-widest">
                  {selectedIds.length} Selected
                </span>
             </div>
             
             <div className="p-8">
                {questions.length === 0 ? (
                  <div className="p-16 bg-gray-50 border border-gray-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                    <BookOpen size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-400 text-sm font-medium">No questions available in your repository.</p>
                    <button
                      type="button"
                      onClick={() => navigate("/teacher/questions/create")}
                      className="mt-6 text-black font-bold text-[13px] hover:underline"
                    >
                      Create one first
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 -mx-2 px-2">
                    {questions.map((q) => {
                      const selected = selectedIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestion(q.id)}
                          className={`p-4 rounded-2xl border transition-all flex items-center gap-5 cursor-pointer group ${
                            selected
                              ? "border-black bg-zinc-950 text-white shadow-lg"
                              : "border-gray-100 bg-white hover:border-gray-300 shadow-sm"
                          }`}
                        >
                          <div className="shrink-0">
                            {selected ? (
                              <CheckSquare size={22} className="text-[#2df07b]" strokeWidth={2.5} />
                            ) : (
                              <Square size={22} className="text-gray-200 group-hover:text-gray-400" strokeWidth={2.5} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-[16px] truncate ${selected ? "text-white" : "text-gray-900"}`}>
                              {q.title}
                            </p>
                            <div className={`flex items-center gap-3 mt-1 font-bold text-[11px] uppercase tracking-widest ${selected ? "text-gray-500" : "text-gray-400"}`}>
                              <span>{q.marks} Marks</span>
                              <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                              <span>{q.expectedTimeComplexity || 'O(n)'}</span>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider shrink-0 ${difficultyColor[q.difficulty] || "text-gray-400 bg-gray-50 border-gray-100"}`}
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
            <button
               type="button"
               onClick={() => navigate("/teacher")}
               className="text-gray-500 font-bold text-sm hover:text-black transition-colors px-6"
            >
               Discard Assessment
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-bold py-4 px-12 rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Generating..." : "Finalize & Launch Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
