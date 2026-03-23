import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { teacherService } from "../../services/api";
import { BarChart2, BookOpen, Clock, ArrowRight, ChevronLeft, Calendar, Zap, ClipboardList, Loader2 } from "lucide-react";

export function TeacherResults() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    teacherService.getTests()
      .then(data => {
        const sortedTests = [...data].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setTests(sortedTests);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in pb-20 relative z-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="flex items-center gap-6">
             <button 
                onClick={() => navigate('/teacher')}
                className="p-3 border border-white/10 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-xl group"
             >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
             </button>
             <div>
                <div className="flex items-center gap-2 mb-2 text-[#2df07b]">
                   <BarChart2 size={14} />
                   <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Performance Analytics</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight uppercase">Analytics Vault</h1>
                <p className="text-gray-400 mt-2 text-[15px] font-medium max-w-xl">Deep-dive into student performance vectors and historical assessment data.</p>
             </div>
          </div>
          <div className="flex items-center gap-4 bg-[#111111] text-white px-7 py-4 rounded-2xl border border-white/5 shadow-2xl transition-all hover:border-white/10 group">
             <div className="w-10 h-10 rounded-lg bg-[#2df07b]/10 flex items-center justify-center text-[#2df07b] border border-[#2df07b]/20 group-hover:scale-110 transition-transform">
                <BarChart2 size={20} strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Total Protocols</p>
                <p className="text-[15px] font-bold text-white leading-none mt-1">{tests.length} Streamed Units</p>
             </div>
          </div>
        </div>

        {/* Content Stream */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-[#111111] border border-white/5 rounded-[32px] animate-pulse"></div>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 border-dashed rounded-[40px] p-24 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="p-8 bg-white/5 rounded-3xl mb-8">
              <BookOpen size={64} className="text-gray-600" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Zero Historical Data</h3>
            <p className="text-gray-500 mt-4 max-w-sm font-medium leading-relaxed">
              Initialize your first assessment protocol to start recording student performance metrics.
            </p>
            <Link
              to="/teacher/tests/create"
              className="mt-10 bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-4 px-12 rounded-xl transition-all shadow-lg shadow-[#2df07b]/10 active:scale-95 uppercase tracking-widest text-[11px] flex items-center gap-3"
            >
              <ClipboardList size={18} /> Launch First Protocol
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {tests.map((test) => (
              <div
                key={test.id}
                className="group bg-[#111111] border border-white/10 hover:border-[#2df07b]/30 rounded-[32px] p-9 flex flex-col hover:shadow-2xl transition-all relative overflow-hidden h-auto min-h-[360px] shadow-xl"
              >
                {/* Background Detail */}
                <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-[0.03] text-white transition-opacity pointer-events-none">
                   <Zap size={200} />
                </div>

                <div className="flex justify-between items-start mb-10 relative z-10">
                   <div className="min-w-0">
                      <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border inline-block mb-4 ${test.status === "ACTIVE" ? "bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20" : "bg-white/5 text-gray-500 border-white/5"}`}>
                        {test.status || "Archived"}
                      </span>
                      <h3 className="text-2xl font-bold text-white truncate pr-4 leading-tight group-hover:text-white transition-colors uppercase tracking-tight">
                        {test.name}
                      </h3>
                   </div>
                </div>

                <div className="space-y-6 mb-12 flex-1 relative z-10">
                  <div className="flex items-center text-gray-400 text-[10px] gap-4 font-bold uppercase tracking-widest">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-[#2df07b] group-hover:text-black transition-all border border-white/5">
                       <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-gray-600 text-[9px] mb-0.5">Protocol Runtime</p>
                      <span className="text-white">{test.duration} Minutes</span>
                    </div>
                  </div>
                  {test.startTime && (
                    <div className="flex items-center text-gray-400 text-[10px] gap-4 font-bold uppercase tracking-widest">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-[#2df07b] group-hover:text-black transition-all border border-white/5">
                         <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-gray-600 text-[9px] mb-0.5">Activation Date</p>
                        <span className="text-white">{new Date(test.startTime).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to={`/teacher/tests/${test.id}`}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white hover:text-black font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 text-[11px] shadow-sm uppercase tracking-widest active:scale-95 relative z-10 text-white"
                >
                  Retrieve Metrics
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

