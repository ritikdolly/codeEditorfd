import { useState } from "react";
import { teacherService } from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, Loader2, Info, ChevronLeft } from "lucide-react";

const emptyTestCase = { input: "", expectedOutput: "", isHidden: false };

export function CreateQuestion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
    expectedTimeComplexity: "",
    marks: 10,
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    prefixCode: "",
    suffixCode: "",
    templateCode: "",
  });
  const [testCases, setTestCases] = useState([{ ...emptyTestCase }]);

  const addTestCase = () => setTestCases([...testCases, { ...emptyTestCase }]);
  const removeTestCase = (i) =>
    setTestCases(testCases.filter((_, idx) => idx !== i));
  const updateTestCase = (i, field, value) => {
    const updated = [...testCases];
    updated[i] = { ...updated[i], [field]: value };
    setTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teacherService.createQuestion({ ...form, testCases });
      toast.success("Question created successfully!");
      navigate("/teacher/questions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => navigate('/teacher/questions')}
                className="p-2 border border-gray-100 bg-white rounded-lg text-gray-400 hover:text-black hover:border-gray-300 transition-all shadow-sm"
             >
                <ChevronLeft size={20} />
             </button>
             <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Question</h1>
                <p className="text-gray-500 mt-1 text-[15px]">Define a new coding problem for your question library.</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Core Problem Info */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <Info size={18} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Problem Definition</h2>
             </div>
             
             <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 gap-6">
                   <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Title *</label>
                    <input
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 font-medium shadow-sm"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Find Maximum Element"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Problem Context *</label>
                    <textarea
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 min-h-[160px] leading-relaxed font-medium"
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Explain the problem logic, input requirements, and expected behavior..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Difficulty</label>
                    <select
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black font-bold appearance-none cursor-pointer"
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Total Points</label>
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black font-bold"
                      type="number"
                      min="1"
                      value={form.marks}
                      onChange={(e) => setForm({ ...form, marks: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Time Complexity</label>
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black font-bold"
                      placeholder="e.g. O(log n)"
                      value={form.expectedTimeComplexity}
                      onChange={(e) => setForm({ ...form, expectedTimeComplexity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Input Format</label>
                    <textarea
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black font-medium min-h-[100px]"
                      placeholder="Detailed input specifications..."
                      value={form.inputFormat}
                      onChange={(e) => setForm({ ...form, inputFormat: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Output Format</label>
                    <textarea
                      className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black font-medium min-h-[100px]"
                      placeholder="Detailed output specifications..."
                      value={form.outputFormat}
                      onChange={(e) => setForm({ ...form, outputFormat: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Constraints</label>
                   <textarea
                     className="w-full bg-gray-50 border-none rounded-xl text-gray-900 px-5 py-3 focus:ring-1 focus:ring-black font-bold placeholder:font-medium"
                     placeholder="e.g. -10^9 <= n <= 10^9"
                     value={form.constraints}
                     onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                   />
                </div>
             </div>
          </div>

          {/* Section 2: Code Templates */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <PlusCircle size={18} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Environment Skeleton</h2>
             </div>
             
             <div className="p-8 space-y-8">
                <div>
                   <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Initial Starter Code</label>
                   <textarea
                     className="w-full bg-gray-900 border-none rounded-xl text-gray-200 px-5 py-4 focus:ring-1 focus:ring-[#2df07b] font-mono text-[13px] leading-relaxed min-h-[180px]"
                     placeholder="public class Solution { \n  /* START_EDITABLE */ \n  /* END_EDITABLE */ \n }"
                     value={form.templateCode}
                     onChange={(e) => setForm({ ...form, templateCode: e.target.value })}
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Prefix Snippet</label>
                    <textarea
                      className="w-full bg-gray-900 border-none rounded-xl text-gray-400 px-5 py-4 focus:ring-1 focus:ring-[#2df07b] font-mono text-[13px] leading-relaxed min-h-[120px]"
                      placeholder="Hidden imports or setup..."
                      value={form.prefixCode}
                      onChange={(e) => setForm({ ...form, prefixCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">Suffix Snippet</label>
                    <textarea
                      className="w-full bg-gray-900 border-none rounded-xl text-gray-400 px-5 py-4 focus:ring-1 focus:ring-[#2df07b] font-mono text-[13px] leading-relaxed min-h-[120px]"
                      placeholder="Hidden driver logic..."
                      value={form.suffixCode}
                      onChange={(e) => setForm({ ...form, suffixCode: e.target.value })}
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Section 3: Validation Engine */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <PlusCircle size={18} className="text-gray-400" />
                   <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Test Scenarios</h2>
                </div>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="text-xs font-bold text-black bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 shadow-sm"
                >
                  <PlusCircle size={14} /> Add Scenario
                </button>
             </div>
             
             <div className="p-8 space-y-6">
                {testCases.map((tc, i) => (
                  <div key={i} className="group p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-6 relative">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center pointer-events-none">
                             {i + 1}
                           </span>
                           <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Test Vector</h3>
                        </div>
                        <div className="flex items-center gap-6">
                           <label className="flex items-center gap-2 cursor-pointer group">
                             <input
                               type="checkbox"
                               checked={tc.isHidden}
                               onChange={(e) => updateTestCase(i, "isHidden", e.target.checked)}
                               className="w-4 h-4 text-black border-gray-200 rounded focus:ring-black cursor-pointer accent-black"
                             />
                             <span className="text-[12px] font-bold text-gray-500 group-hover:text-black transition-colors uppercase tracking-widest">Hidden</span>
                           </label>
                           {testCases.length > 1 && (
                             <button
                               type="button"
                               onClick={() => removeTestCase(i)}
                               className="text-gray-400 hover:text-red-500 transition-colors p-1"
                             >
                               <Trash2 size={16} />
                             </button>
                           )}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Standard Input</label>
                           <textarea
                             className="w-full bg-white border border-gray-100 rounded-xl text-gray-900 px-4 py-3 focus:ring-1 focus:ring-black font-mono text-[13px] min-h-[100px] shadow-sm"
                             value={tc.input}
                             onChange={(e) => updateTestCase(i, "input", e.target.value)}
                             placeholder="5&#10;1 2 3 4 5"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Expected Output</label>
                           <textarea
                             className="w-full bg-white border border-gray-100 rounded-xl text-gray-900 px-4 py-3 focus:ring-1 focus:ring-black font-mono text-[13px] min-h-[100px] shadow-sm"
                             value={tc.expectedOutput}
                             onChange={(e) => updateTestCase(i, "expectedOutput", e.target.value)}
                             placeholder="15"
                           />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
            <button
               type="button"
               onClick={() => navigate("/teacher/questions")}
               className="text-gray-500 font-bold text-sm hover:text-black transition-colors px-6"
            >
               Discard Changes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-bold py-4 px-12 rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Committing..." : "Deploy Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
