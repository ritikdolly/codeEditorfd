import { useState, useEffect } from "react";
import { teacherService } from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  PlusCircle,
  Trash2,
  Loader2,
  BookOpen,
  Code,
  Settings,
  Beaker,
  ArrowLeft,
  Info,
  HelpCircle,
  Save,
  Globe,
  EyeOff,
  ChevronLeft,
  Zap,
  Database,
  Terminal,
  Shield,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const emptyTestCase = { input: "", expectedOutput: "", isHidden: false };

export function CreateQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
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
    visibility: "GLOBAL",
  });
  const [testCases, setTestCases] = useState([{ ...emptyTestCase }]);

  useEffect(() => {
    if (id) {
      teacherService
        .getQuestion(id)
        .then((data) => {
          setForm({
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            expectedTimeComplexity: data.expectedTimeComplexity || "",
            marks: data.marks,
            inputFormat: data.inputFormat || "",
            outputFormat: data.outputFormat || "",
            constraints: data.constraints || "",
            prefixCode: data.prefixCode || "",
            suffixCode: data.suffixCode || "",
            templateCode: data.templateCode || "",
            visibility: data.visibility || "PRIVATE",
          });
          if (data.testCases && data.testCases.length > 0) {
            setTestCases(
              data.testCases.map((tc) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden,
              })),
            );
          }
        })
        .catch((err) => {
          toast.error("Failed to load question details");
          navigate("/teacher/questions");
        })
        .finally(() => setFetching(false));
    }
  }, [id, navigate]);

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
      if (id) {
        await teacherService.updateQuestion(id, { ...form, testCases });
        toast.success("Vector successfully recalibrated.");
      } else {
        await teacherService.createQuestion({ ...form, testCases });
        toast.success("New vector transmitted to neural bank.");
      }
      navigate("/teacher/questions");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${id ? "update" : "create"} vector`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center animate-pulse gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          Accessing Neural Records...
        </span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20 relative z-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => navigate("/teacher/questions")}
              className="p-3 border border-white/10 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-xl group"
            >
              <ChevronLeft
                size={22}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2 text-accent">
                <Database size={14} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  Neural Bank Specification
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight uppercase">
                {id ? "Refine Vector" : "Initialize Vector"}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: Core Problem Info */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden group">
            <div className="px-8 py-5 border-b border-white/5 bg-white/2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-accent" />
                <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">
                  Problem Definition
                </h2>
              </div>
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                Spec 01
              </div>
            </div>

            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Vector Designation (Title) *
                  </label>
                  <input
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-accent transition-all placeholder:text-gray-700 font-bold shadow-xl"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. Find Maximum Element"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Contextual Description *
                  </label>
                  <textarea
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-accent transition-all placeholder:text-gray-700 min-h-40 leading-relaxed font-medium shadow-xl custom-scrollbar"
                    required
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Explain the problem logic, input requirements, and expected behavior..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/5">
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Intensity Level
                  </label>
                  <select
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-accent font-bold uppercase tracking-widest appearance-none cursor-pointer shadow-xl"
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({ ...form, difficulty: e.target.value })
                    }
                  >
                    <option value="EASY">Easy presence</option>
                    <option value="MEDIUM">Medium presence</option>
                    <option value="HARD">Hard presence</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Weightage (Marks)
                  </label>
                  <input
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-accent font-bold shadow-xl"
                    type="number"
                    min="1"
                    value={form.marks}
                    onChange={(e) =>
                      setForm({ ...form, marks: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Temporal Optimization
                  </label>
                  <input
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-accent font-bold shadow-xl"
                    placeholder="e.g. O(log n)"
                    value={form.expectedTimeComplexity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expectedTimeComplexity: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Technical Specs Internal Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Input Schema
                  </label>
                  <textarea
                    className="w-full bg-[#161616] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-accent font-medium min-h-25 shadow-xl custom-scrollbar"
                    placeholder="Detailed input specifications..."
                    value={form.inputFormat}
                    onChange={(e) =>
                      setForm({ ...form, inputFormat: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Output Schema
                  </label>
                  <textarea
                    className="w-full bg-[#161616] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-accent font-medium min-h-25 shadow-xl custom-scrollbar"
                    placeholder="Detailed output specifications..."
                    value={form.outputFormat}
                    onChange={(e) =>
                      setForm({ ...form, outputFormat: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Logical Constraints
                </label>
                <textarea
                  className="w-full bg-[#161616] border border-white/5 rounded-xl text-white px-5 py-3.5 focus:outline-none focus:border-accent font-bold placeholder:font-medium shadow-xl custom-scrollbar"
                  placeholder="e.g. -10^9 <= n <= 10^9"
                  value={form.constraints}
                  onChange={(e) =>
                    setForm({ ...form, constraints: e.target.value })
                  }
                />
              </div>

              {/* Visibility Section for Teachers */}
              {useAuthStore.getState().user?.role === "TEACHER" && (
                <div className="pt-10 border-t border-white/5 space-y-6">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-accent" />
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Visibility Protocol
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, visibility: "PRIVATE" })
                      }
                      className={`flex items-center gap-4 p-6 rounded-2xl border transition-all ${
                        form.visibility === "PRIVATE"
                          ? "bg-accent/10 border-accent shadow-[0_0_20px_rgba(45,240,123,0.1)]"
                          : "bg-black/20 border-white/5 text-gray-500 hover:border-white/10"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl ${form.visibility === "PRIVATE" ? "bg-accent text-black" : "bg-white/5"}`}
                      >
                        <EyeOff size={20} />
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-bold text-sm uppercase tracking-tight ${form.visibility === "PRIVATE" ? "text-white" : "text-gray-400"}`}
                        >
                          Private Access
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Only you can access this vector.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, visibility: "GLOBAL" })}
                      className={`flex items-center gap-4 p-6 rounded-2xl border transition-all ${
                        form.visibility === "GLOBAL"
                          ? "bg-accent/10 border-accent shadow-[0_0_20px_rgba(45,240,123,0.1)]"
                          : "bg-black/20 border-white/5 text-gray-500 hover:border-white/10"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl ${form.visibility === "GLOBAL" ? "bg-accent text-black" : "bg-white/5"}`}
                      >
                        <Globe size={20} />
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-bold text-sm uppercase tracking-tight ${form.visibility === "GLOBAL" ? "text-white" : "text-gray-400"}`}
                        >
                          Open Library
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Available to all neural nodes.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Code Templates */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden group">
            <div className="px-8 py-5 border-b border-white/5 bg-white/2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-accent" />
                <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">
                  Compiler Skeleton
                </h2>
              </div>
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                Core 02
              </div>
            </div>

            <div className="p-8 space-y-10">
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Initial Prototype Code
                </label>
                <div className="rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                  <textarea
                    className="w-full bg-[#050505] text-accent px-6 py-6 focus:outline-none font-mono text-[14px] leading-relaxed min-h-[220px] custom-scrollbar"
                    placeholder="public class Solution { \n  /* START_EDITABLE */ \n  /* END_EDITABLE */ \n }"
                    value={form.templateCode}
                    onChange={(e) =>
                      setForm({ ...form, templateCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Namespace Imports (Prefix)
                  </label>
                  <textarea
                    className="w-full bg-[#050505] border border-white/5 rounded-xl text-gray-500 px-5 py-4 focus:outline-none focus:border-white/20 font-mono text-[13px] leading-relaxed min-h-[140px] custom-scrollbar shadow-xl"
                    placeholder="Hidden imports or pre-logic..."
                    value={form.prefixCode}
                    onChange={(e) =>
                      setForm({ ...form, prefixCode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Driver Engine (Suffix)
                  </label>
                  <textarea
                    className="w-full bg-[#050505] border border-white/5 rounded-xl text-gray-500 px-5 py-4 focus:outline-none focus:border-white/20 font-mono text-[13px] leading-relaxed min-h-[140px] custom-scrollbar shadow-xl"
                    placeholder="Hidden driver or main logic..."
                    value={form.suffixCode}
                    onChange={(e) =>
                      setForm({ ...form, suffixCode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Validation Engine */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden group">
            <div className="px-8 py-5 border-b border-white/5 bg-white/2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-accent" />
                <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">
                  Verification Clusters
                </h2>
              </div>
              <button
                type="button"
                onClick={addTestCase}
                className="text-[10px] font-bold text-black bg-accent px-4 py-2 rounded-lg hover:bg-accent-dark transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest active:scale-95"
              >
                <PlusCircle size={14} /> Link Scenario
              </button>
            </div>

            <div className="p-8 space-y-8">
              {testCases.map((tc, i) => (
                <div
                  key={i}
                  className="group/cluster p-8 bg-white/1 rounded-2xl border border-white/5 flex flex-col gap-8 relative hover:border-white/10 transition-colors shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent text-[12px] font-bold flex items-center justify-center border border-accent/20">
                        {i + 1}
                      </span>
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">
                        Validation Vector {i + 1}
                      </h3>
                    </div>
                    <div className="flex items-center gap-8">
                      <label className="flex items-center gap-3 cursor-pointer group/toggle">
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) =>
                              updateTestCase(i, "isHidden", e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover/toggle:text-gray-300 transition-colors uppercase tracking-widest">
                          Classified Vector
                        </span>
                      </label>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(i)}
                          className="text-gray-600 hover:text-rose-500 transition-colors p-2 bg-white/5 rounded-lg border border-white/5"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                        Raw Input Stream
                      </label>
                      <textarea
                        className="w-full bg-[#050505] border border-white/5 rounded-xl text-gray-300 px-5 py-4 focus:outline-none focus:border-accent font-mono text-[13px] min-h-30 shadow-xl custom-scrollbar"
                        value={tc.input}
                        onChange={(e) =>
                          updateTestCase(i, "input", e.target.value)
                        }
                        placeholder="5&#10;1 2 3 4 5"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                        Integrity Threshold (Output)
                      </label>
                      <textarea
                        className="w-full bg-[#050505] border border-white/5 rounded-xl text-accent px-5 py-4 focus:outline-none focus:border-accent font-mono text-[13px] min-h-30 shadow-xl custom-scrollbar"
                        value={tc.expectedOutput}
                        onChange={(e) =>
                          updateTestCase(i, "expectedOutput", e.target.value)
                        }
                        placeholder="15"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {testCases.length === 0 && (
                <div className="text-center py-12 bg-white/1 rounded-2xl border border-white/5 border-dashed">
                  <p className="text-gray-600 text-[11px] font-bold uppercase tracking-widest">
                    No validation clusters defined.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
            <button
              type="button"
              onClick={() => navigate("/teacher/questions")}
              className="text-gray-600 font-bold text-[11px] uppercase tracking-widest hover:text-white transition-all px-8 py-3.5 bg-white/5 rounded-xl border border-white/5 active:scale-95"
            >
              Discard Buffer
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-64 bg-accent hover:bg-accent-dark text-black font-bold py-4 px-12 rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[12px] shadow-accent/10"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} strokeWidth={2.5} />
              )}
              {loading
                ? "Transmitting..."
                : id
                  ? "Finalize Vector"
                  : "Deploy Vector"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

