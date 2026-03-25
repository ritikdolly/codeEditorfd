import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { teacherService } from '../../services/api';
import { 
  BarChart2, 
  BookOpen, 
  Clock, 
  Users, 
  ArrowRight, 
  ClipboardList, 
  Calendar, 
  CheckCircle, 
  Play, 
  AlertCircle,
  Search,
  ChevronRight
} from 'lucide-react';

export function TeacherResults() {
  const [tests, setTests] = useState([]);
  const [analyticsMap, setAnalyticsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'startTime', direction: 'desc' });

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

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const processedTests = useMemo(() => {
    let filtered = tests;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      filtered = tests.filter(t => 
        t.name?.toLowerCase().includes(q) || 
        t.status?.toLowerCase().includes(q)
      );
    }
    
    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Override for analytics values
      if (['totalStudentsAppeared', 'totalStudentsPassed', 'totalStudentsFailed'].includes(sortConfig.key)) {
        aVal = analyticsMap[a.id]?.[sortConfig.key] || 0;
        bVal = analyticsMap[b.id]?.[sortConfig.key] || 0;
      }
      
      // Override for strings
      if (sortConfig.key === 'name' || sortConfig.key === 'status') {
         aVal = aVal?.toLowerCase() || '';
         bVal = bVal?.toLowerCase() || '';
      }
      
      if (aVal === undefined || aVal === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bVal === undefined || bVal === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tests, analyticsMap, sortConfig, filterQuery]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const SortHeader = ({ label, sortKey, align = 'left' }) => (
    <th
      className={`px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors select-none ${align === 'center' ? 'text-center' : 'text-left'}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : ''}`}>
        {label}
        <span className={`text-[10px] flex flex-col -space-y-1 ${sortConfig.key === sortKey ? 'text-accent' : 'text-gray-700'}`}>
          <span className={sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'opacity-100' : 'opacity-40'}>▴</span>
          <span className={sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'opacity-100' : 'opacity-40'}>▾</span>
        </span>
      </div>
    </th>
  );

  return (
    <div className="pb-20 relative z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-linear-to-br from-accent to-emerald-600 shadow-xl shadow-accent/20 ring-1 ring-white/20">
            <BarChart2 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight uppercase">Test Results</h1>
            <p className="text-gray-400 font-medium max-w-md mt-2 italic opacity-80 uppercase text-[10px] tracking-widest">Select a test to deep-dive into student insights.</p>
          </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
               <input 
                 type="text"
                 placeholder="Search tests..."
                 value={filterQuery}
                 onChange={(e) => setFilterQuery(e.target.value)}
                 className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-3.5 pl-12 text-sm text-white focus:outline-none focus:border-accent/50 transition-all placeholder:text-gray-700 font-bold uppercase tracking-tight"
               />
            </div>
            <Link to="/teacher/tests/create" className="bg-accent hover:bg-accent-dark text-black font-bold py-3.5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 text-[11px] shadow-lg shadow-accent/20 active:scale-95 uppercase tracking-widest whitespace-nowrap w-full sm:w-auto">
               <ClipboardList size={20} />
               <span>Schedule New Test</span>
            </Link>
          </div>
        </div>

        {/* Tests List - Tabular View */}
        {tests.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 border-dashed rounded-[48px] p-24 flex flex-col items-center justify-center text-center shadow-2xl group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
               <BookOpen size={150} className="text-accent" />
            </div>
            <ClipboardList className="text-white/5 mb-8" size={80} strokeWidth={1} />
            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight uppercase">No Tests Found</h3>
            <p className="text-gray-500 mb-10 max-w-sm leading-relaxed font-medium italic opacity-60 uppercase text-[10px] tracking-widest">
              Your assessment history is empty. Launch a new test to start collecting student performance data.
            </p>
            <Link to="/teacher/tests/create" className="bg-accent hover:bg-accent-dark text-black font-bold py-4 px-10 rounded-2xl transition-all active:scale-95 text-[11px] uppercase tracking-widest shadow-xl shadow-accent/20">
              Create First Test
            </Link>
          </div>
        ) : (
          <div className="bg-[#111111] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <SortHeader label="TEST NAME" sortKey="name" />
                    <SortHeader label="STATUS" sortKey="status" align="center" />
                    <SortHeader label="DATE & TIME" sortKey="startTime" />
                    <SortHeader label="DURATION" sortKey="duration" />
                    <SortHeader label="APPEARED" sortKey="totalStudentsAppeared" align="center" />
                    <SortHeader label="PASSED" sortKey="totalStudentsPassed" align="center" />
                    <SortHeader label="FAILED" sortKey="totalStudentsFailed" align="center" />
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {processedTests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-8 py-20 text-center text-gray-700 italic font-bold uppercase tracking-widest">
                        No tests match your search.
                      </td>
                    </tr>
                  ) : (
                    processedTests.map(test => {
                      const analytics = analyticsMap[test.id];
                      
                      return (
                        <tr key={test.id} className="hover:bg-white/[0.02] transition-all group/row">
                          <td className="px-8 py-6">
                            <p className="text-white font-bold text-sm uppercase tracking-tight group-hover/row:text-accent transition-colors">{test.name}</p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                              test.status === 'ACTIVE' 
                                ? 'bg-accent/10 text-accent border-accent/20' 
                                : test.status === 'COMPLETED'
                                ? 'bg-white/5 text-gray-500 border-white/5'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {test.status || 'SCHEDULED'}
                            </span>
                          </td>
                          <td className="px-6 py-6 font-mono text-gray-400 text-xs">
                             {test.startTime ? (
                               <div className="flex flex-col gap-0.5">
                                 <span className="text-white/80">{new Date(test.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                 <span className="text-[10px] text-gray-600 font-bold uppercase">{new Date(test.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                               </div>
                             ) : (
                               <span className="text-gray-700 italic font-bold uppercase text-[10px]">Not Set</span>
                             )}
                          </td>
                          <td className="px-6 py-6 text-gray-400 font-bold text-xs">
                             {test.duration} <span className="text-[9px] uppercase tracking-tighter opacity-50">MIN</span>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <span className="text-white font-mono font-bold">{analytics?.totalStudentsAppeared || 0}</span>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <span className="text-accent font-mono font-bold">{analytics?.totalStudentsPassed || 0}</span>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <span className="text-rose-500 font-mono font-bold">{analytics?.totalStudentsFailed || 0}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <Link 
                               to={`/teacher/tests/${test.id}`}
                               className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-white hover:bg-accent hover:text-black text-[10px] font-bold uppercase tracking-widest transition-all group/btn shadow-xl border border-white/5 hover:border-accent"
                             >
                               <span>Inspect</span>
                               <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                             </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


