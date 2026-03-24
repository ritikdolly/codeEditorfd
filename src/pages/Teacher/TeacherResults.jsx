import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherService } from '../../services/api';
import { BarChart2, BookOpen, Clock, Users, ArrowRight, ClipboardList, Calendar, CheckCircle, Play, AlertCircle } from 'lucide-react';

export function TeacherResults() {
  const [tests, setTests] = useState([]);
  const [analyticsMap, setAnalyticsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherService.getTests()
      .then(async (data) => {
        const sortedTests = [...data].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        
        const now = Date.now();
        const enrichedTests = sortedTests.map(t => {
           let calcStatus = 'SCHEDULED';
           if (t.startTime && t.endTime) {
              const start = new Date(t.startTime).getTime();
              const end = new Date(t.endTime).getTime();
              if (now >= start && now <= end) {
                 calcStatus = 'ACTIVE';
              } else if (now > end) {
                 calcStatus = 'COMPLETED';
              }
           }
           return { ...t, status: calcStatus };
        });
        
        setTests(enrichedTests);
        
        // Fetch analytics for all tests concurrently
        const analyticsPromises = sortedTests.map(t => 
          teacherService.getTestAnalytics(t.id)
            .then(analytics => ({ testId: t.id, analytics }))
            .catch(() => null)
        );
        
        const analyticsResults = await Promise.all(analyticsPromises);
        const map = {};
        analyticsResults.forEach(res => {
          if (res) map[res.testId] = res.analytics;
        });
        setAnalyticsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2df07b]"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 relative z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#2df07b]/10 border border-[#2df07b]/20">
            <BarChart2 className="text-[#2df07b]" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight uppercase">Analytics Hub</h1>
            <p className="text-gray-400 font-medium max-w-md mt-2">Select a test to deep-dive into student insights and performance metrics.</p>
          </div>
        </div>
        <Link to="/teacher/tests/create" className="bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3.5 px-8 rounded-xl transition-all flex items-center gap-3 text-sm shadow-lg shadow-[#2df07b]/20 active:scale-95 uppercase tracking-widest whitespace-nowrap">
           <ClipboardList size={18} />
           <span>Schedule New Test</span>
        </Link>
      </div>

        {/* Content Stream */}
        {tests.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-2xl">
            <ClipboardList className="text-white/5 mb-6" size={64} strokeWidth={1} />
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">No Tests Found</h3>
            <p className="text-gray-500 mb-8 max-w-sm leading-relaxed font-medium">
              Your assessment history is empty. Launch a new test to start collecting student performance data.
            </p>
            <Link to="/teacher/tests/create" className="bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3 px-8 rounded-xl transition-all active:scale-95 text-sm uppercase tracking-widest shadow-lg">
              Create First Test
            </Link>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map(test => (
            <div key={test.id} className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col hover:border-[#2df07b]/30 transition-all duration-300 group relative overflow-hidden h-[300px] shadow-xl">
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2df07b]/5 blur-[60px] group-hover:bg-[#2df07b]/10 transition-all duration-500"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-[#2df07b]/10 group-hover:border-[#2df07b]/20 transition-all">
                   <Calendar size={20} className="text-gray-500 group-hover:text-[#2df07b]" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  test.status === 'ACTIVE' 
                    ? 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20' 
                    : test.status === 'COMPLETED' ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {test.status || 'SCHEDULED'}
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="text-xl font-bold text-white truncate mb-2 group-hover:text-[#2df07b] transition-colors uppercase tracking-tight" title={test.name}>{test.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-500 font-bold text-[11px] uppercase tracking-wider gap-2">
                    <Clock size={14} />
                    <span>Duration: <span className="text-white">{test.duration} Minutes</span></span>
                  </div>
                  {test.startTime ? (
                    <div className="flex items-center text-gray-500 font-bold text-[11px] uppercase tracking-wider gap-2">
                      <Play size={14} />
                      <span>Starts: <span className="text-white">{new Date(test.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {new Date(test.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span></span>
                    </div>
                  ) : (
                     <div className="flex items-center text-gray-600 font-bold text-[11px] uppercase tracking-wider gap-2 opacity-50">
                        <AlertCircle size={14} />
                        <span>Date Not Set</span>
                     </div>
                  )}
                </div>
              </div>
              
              <Link 
                to={`/teacher/tests/${test.id}`}
                className="mt-6 w-full py-4 rounded-xl bg-white/5 hover:bg-[#2df07b] border border-white/5 hover:border-[#2df07b] text-white hover:text-black text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative z-10"
              >
                <span>View Analytics</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

