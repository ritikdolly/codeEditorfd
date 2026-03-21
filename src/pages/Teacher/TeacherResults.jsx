import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { teacherService } from "../../services/api";
import { BarChart2, BookOpen, Clock, ArrowRight, ChevronLeft, Calendar } from "lucide-react";

export function TeacherResults() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    teacherService
      .getTests()
      .then(setTests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in pb-20">
      <div className="max-w-7xl mx-auto space-y-10">
        
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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Performance Hub</h1>
                <p className="text-gray-500 mt-1 text-[15px]">Select an assessment to evaluate student performance and export data.</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg font-black text-[10px] text-gray-400 uppercase tracking-widest">
             <BarChart2 size={16} />
             {tests.length} Assessments Tracked
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-gray-100 shadow-sm"></div>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white border border-gray-100 border-dashed rounded-[40px] p-24 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="p-6 bg-gray-50 rounded-full mb-8">
              <BookOpen size={48} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No data recorded</h3>
            <p className="text-gray-500 mb-10 max-w-sm text-[15px] font-medium leading-relaxed">
              Launch your first assessment to begin tracking student progress and generating performance analytics.
            </p>
            <Link
              to="/teacher/tests/create"
              className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-xl active:scale-95"
            >
              Create First Test
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.map((test) => (
              <div
                key={test.id}
                className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col hover:border-zinc-900 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                   <BarChart2 size={120} strokeWidth={0.5} />
                </div>

                <div className="flex justify-between items-start mb-10 relative z-10">
                   <div className="min-w-0">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border inline-block mb-3 ${test.status === "ACTIVE" ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                        {test.status || "Scheduled"}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 truncate pr-4 leading-tight group-hover:text-black transition-colors">
                        {test.name}
                      </h3>
                   </div>
                </div>

                <div className="space-y-4 mb-10 flex-1 relative z-10">
                  <div className="flex items-center text-gray-400 text-[11px] gap-3 font-black uppercase tracking-widest">
                    <Clock size={16} className="text-gray-300" />
                    <span>Duration: <span className="text-gray-900">{test.duration} Minutes</span></span>
                  </div>
                  {test.startTime && (
                    <div className="flex items-center text-gray-400 text-[11px] gap-3 font-black uppercase tracking-widest">
                      <Calendar size={16} className="text-gray-300" />
                      <span>Activated: <span className="text-gray-900">{new Date(test.startTime).toLocaleDateString([], { dateStyle: 'medium' })}</span></span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/teacher/tests/${test.id}`}
                  className="w-full bg-zinc-950 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md active:scale-95 relative z-10"
                >
                  Inspect Results
                  <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
