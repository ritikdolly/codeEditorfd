import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { teacherService } from '../../services/api';
import { BarChart2, BookOpen, Clock, Users, ArrowRight, ClipboardList, Calendar, CheckCircle, Play, AlertCircle } from 'lucide-react';

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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const SortHeader = ({ label, sortKey, align='left' }) => (
    <th 
      className={`px-4 py-3 font-medium cursor-pointer hover:bg-slate-700/30 transition-colors select-none ${align === 'center' ? 'text-center' : 'text-left'}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : ''}`}>
        {label}
        <span className={`text-[10px] flex flex-col -space-y-1 ${sortConfig.key === sortKey ? 'text-purple-400' : 'text-slate-600'}`}>
          <span className={sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'opacity-100' : 'opacity-40'}>▲</span>
          <span className={sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'opacity-100' : 'opacity-40'}>▼</span>
        </span>
      </div>
    </th>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/20 ring-1 ring-white/20">
            <BarChart2 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Analytics Hub</h1>
            <p className="text-slate-400 font-medium max-w-md">Select a test to deep-dive into student insights and performance metrics.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <input 
            type="text"
            placeholder="Search tests..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full sm:w-64 bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500"
          />
          <Link to="/teacher/tests/create" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group whitespace-nowrap">
             <ClipboardList size={18} />
             <span>Schedule New Test</span>
          </Link>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center border-dashed border-slate-700/50 group hover:border-purple-500/30 transition-colors">
          <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 ring-1 ring-slate-700/50 group-hover:ring-purple-500/20 transition-all">
            <BookOpen size={40} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">No Tests Found</h3>
          <p className="text-slate-400 mb-8 max-w-sm leading-relaxed font-medium">
            Your assessment history is empty. Launch a new test to start collecting student performance data.
          </p>
          <Link to="/teacher/tests/create" className="btn-primary px-8 py-3 rounded-2xl shadow-2xl">
            Create First Test
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/40 border-b border-slate-700/50">
                <tr>
                   <SortHeader label="Test Name" sortKey="name" />
                   <SortHeader label="Status" sortKey="status" align="center" />
                   <SortHeader label="Date & Time" sortKey="startTime" />
                   <SortHeader label="Duration" sortKey="duration" />
                   <SortHeader label="Appeared" sortKey="totalStudentsAppeared" align="center" />
                   <SortHeader label="Passed" sortKey="totalStudentsPassed" align="center" />
                   <SortHeader label="Failed" sortKey="totalStudentsFailed" align="center" />
                   <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {processedTests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      No tests match your search.
                    </td>
                  </tr>
                ) : (
                  processedTests.map(test => {
                    const analytics = analyticsMap[test.id];
                    
                    return (
                      <tr key={test.id} className="hover:bg-slate-700/20 transition-colors group">
                         <td className="px-4 py-4">
                            <p className="text-white font-bold group-hover:text-purple-300 transition-colors">{test.name}</p>
                         </td>
                         <td className="px-4 py-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                              test.status === 'ACTIVE' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : test.status === 'COMPLETED'
                                ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}>
                              {test.status || 'SCHEDULED'}
                            </span>
                         </td>
                         <td className="px-4 py-4">
                            {test.startTime ? (
                              <div className="flex flex-col">
                                <span className="text-slate-200">{new Date(test.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className="text-slate-400 text-xs">{new Date(test.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-xs italic">Not Set</span>
                            )}
                         </td>
                         <td className="px-4 py-4 text-slate-300">
                            {test.duration} <span className="text-slate-500 text-xs">min</span>
                         </td>
                         <td className="px-4 py-4 text-center">
                            <span className="text-white font-mono font-medium">{analytics?.totalStudentsAppeared || 0}</span>
                         </td>
                         <td className="px-4 py-4 text-center">
                            <span className="text-emerald-400 font-mono font-bold">{analytics?.totalStudentsPassed || 0}</span>
                         </td>
                         <td className="px-4 py-4 text-center">
                            <span className="text-rose-400 font-mono font-bold">{analytics?.totalStudentsFailed || 0}</span>
                         </td>
                         <td className="px-4 py-4 text-right">
                            <Link 
                              to={`/teacher/tests/${test.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white text-xs font-bold transition-colors"
                            >
                              <span>Inspect</span>
                              <ArrowRight size={14} />
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
  );
}
