import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { teacherService } from '../../services/api';
import { 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Trophy, 
  Target,
  ArrowLeft,
  Share2,
  Calendar,
  Layout,
  ExternalLink,
  BarChart3,
  Search,
  BookOpen,
  Download,
  Eye,
  QrCode,
  Settings,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

export const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'studentName', direction: 'asc' });
  const [filterQuery, setFilterQuery] = useState('');

  const testLink = `${window.location.origin}/student/test/${id}`;

  const copyTestLink = () => {
    navigator.clipboard.writeText(testLink);
    toast.success('Test link copied to clipboard!');
  };

  useEffect(() => {
    fetchTestData();
  }, [id]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const [questionsData, resultsData, testData] = await Promise.all([
        teacherService.getTestQuestions(id),
        teacherService.getTestResults(id),
        teacherService.getTest(id)
      ]);
      setTest(testData);
      setQuestions(questionsData || []);
      setResults(resultsData || []);
    } catch (error) {
      toast.error('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentExpansion = async (studentId) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
      return;
    }

    setExpandedStudentId(studentId);
    if (!studentDetails[studentId]) {
      try {
        setLoadingDetails(true);
        const details = await teacherService.getStudentTestDetails(id, studentId);
        setStudentDetails(prev => ({ ...prev, [studentId]: details }));
      } catch (error) {
        toast.error('Failed to load student details');
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const processedResults = useMemo(() => {
    let filtered = results;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      filtered = results.filter(r => 
        r.studentName?.toLowerCase().includes(q) || 
        r.studentEmail?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q) ||
        r.submissionStatus?.toLowerCase().includes(q)
      );
    }
    
    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'studentName') {
         aVal = aVal?.toLowerCase() || '';
         bVal = bVal?.toLowerCase() || '';
      }
      
      if (aVal === undefined || aVal === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bVal === undefined || bVal === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [results, sortConfig, filterQuery]);

  const analytics = useMemo(() => {
    return {
      totalStudentsRegistered: results.length,
      totalStudentsAppeared: results.filter(r => r.submissionStatus === 'SUBMITTED' || r.status !== 'NOT_STARTED').length,
      totalStudentsCompleted: results.filter(r => r.submissionStatus === 'SUBMITTED').length,
      totalStudentsPassed: results.filter(r => r.status === 'Pass' || r.status === 'Passed').length,
      totalStudentsFailed: results.filter(r => r.status === 'Fail' || r.status === 'Failed').length,
    };
  }, [results]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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

  const downloadResultsCSV = () => {
    if (!results.length) {
      toast.error("No results to download");
      return;
    }
    const headers = ['Student Name', 'Email', 'Total Score', 'Overall Accuracy (%)', 'Status'];
    const rows = results.map(r => [
      `"${r.studentName}"`, 
      `"${r.studentEmail}"`, 
      r.totalScore?.toFixed(1) || "0", 
      r.overallAccuracy?.toFixed(1) || "0", 
      r.status
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(test?.name || 'test').replace(/\s+/g, '_')}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Download started");
  };

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!test || !test.startTime || !test.endTime) return;

    const calculateTime = () => {
      const now = new Date();
      const start = new Date(test.startTime);
      const end = new Date(test.endTime);

      if (now < start) {
        const diff = start - now;
        setTimeLeft(`Starts in: ${formatDuration(diff)}`);
      } else if (now < end) {
        const diff = end - now;
        setTimeLeft(`Remaining: ${formatDuration(diff)}`);
      } else {
        setTimeLeft('Test Ended');
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [test]);

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
  };

  if (loading || !test) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const averageAccuracy = results.length > 0
    ? results.reduce((sum, r) => sum + (r.overallAccuracy || 0), 0) / results.length
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/5">
        <div>
          <button onClick={() => navigate('/teacher')} className="flex items-center gap-2 text-slate-500 hover:text-accent font-bold text-xs uppercase tracking-widest transition-colors mb-4 group">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
          </button>
          <div className="flex items-center gap-3 mb-2 text-accent">
            <ShieldCheck size={14} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Test Overview</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            {test?.name || 'Loading Test...'}
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <p className="text-gray-500 text-[15px] font-medium italic opacity-80 uppercase text-[10px] tracking-widest">ID: {test?.id?.slice(0,8)}</p>
             {timeLeft && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${timeLeft.includes('Ended') ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                   <Clock size={12} className={timeLeft.includes('Ended') ? 'text-rose-500' : 'text-accent animate-pulse'} />
                   {timeLeft}
                </div>
             )}
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
              onClick={() => navigate(`/teacher/monitor/${id}`)}
              className="flex items-center gap-3 bg-black border border-white/5 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-accent hover:bg-accent/5 transition-all shadow-xl group"
            >
              <Layout size={18} className="text-accent group-hover:scale-110 transition-transform" />
              Live Monitor
            </button>
            <button 
              onClick={copyTestLink}
              className="flex items-center gap-3 bg-accent text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
            >
              <Copy size={18} />
              Share Access
            </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content Area (2/3) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { label: 'Registered', val: analytics.totalStudentsRegistered, icon: Users, color: 'blue' },
               { label: 'Appeared', val: analytics.totalStudentsAppeared, icon: Trophy, color: 'accent' },
               { label: 'Passed', val: analytics.totalStudentsPassed, icon: CheckCircle2, color: 'emerald' },
               { label: 'Failed', val: analytics.totalStudentsFailed, icon: XCircle, color: 'rose' }
             ].map((stat, i) => (
               <div key={i} className="glass-card p-6 border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-accent/20 transition-all">
                  <div className={`absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 group-hover:scale-[1.7] transition-transform ${stat.color === 'accent' ? 'text-accent' : `text-${stat.color}-400`}`}>
                     <stat.icon size={48} />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                     <stat.icon size={16} className={stat.color === 'accent' ? 'text-accent' : `text-${stat.color}-400`} />
                  </div>
                  <p className="text-3xl font-black text-white">{stat.val}</p>
               </div>
             ))}
          </div>

          {/* Filters & Students Table */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  className="w-full bg-slate-900/50 border border-white/5 py-3 pl-12 pr-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all uppercase tracking-tight placeholder:text-slate-700"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={downloadResultsCSV}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all w-full sm:w-auto overflow-hidden group"
              >
                <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> 
                Download CSV
              </button>
            </div>

            <div className="glass-card border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/2 border-b border-white/5 uppercase select-none">
                    <th className="px-6 py-5 w-10"></th>
                    <SortHeader label="Student Account" sortKey="studentName" />
                    <SortHeader label="Score" sortKey="totalScore" align="center" />
                    <SortHeader label="Accuracy" sortKey="overallAccuracy" align="center" />
                    <SortHeader label="Status" sortKey="status" align="center" />
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2">
                  {processedResults.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-600 italic font-bold uppercase tracking-widest">
                        Zero students found matching this criteria
                      </td>
                    </tr>
                  ) : (
                    processedResults.map(r => (
                      <React.Fragment key={r.studentId}>
                        <tr 
                          className={`hover:bg-white/1 transition-all cursor-pointer group ${expandedStudentId === r.studentId ? 'bg-accent/5' : ''}`}
                          onClick={() => toggleStudentExpansion(r.studentId)}
                        >
                          <td className="px-6 py-5">
                             <div className={`p-1 rounded transition-colors ${expandedStudentId === r.studentId ? 'text-accent' : 'text-slate-600'}`}>
                                {expandedStudentId === r.studentId ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                             </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-slate-600 group-hover:text-accent transition-colors">
                                  {r.studentName?.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-white uppercase tracking-tight">{r.studentName}</p>
                                  <p className="text-[10px] font-medium text-slate-600 truncate max-w-35 italic">{r.studentEmail}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center font-bold font-mono text-white text-base">
                             {r.totalScore?.toFixed(1) || 0}
                          </td>
                          <td className="px-6 py-5 text-center">
                             <span className="text-xs font-black text-slate-500">{r.overallAccuracy?.toFixed(1) || 0}%</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                               r.status === 'Pass' || r.status === 'Passed'
                                 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                 : r.status === 'Fail' || r.status === 'Failed'
                                 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                 : 'bg-white/5 text-gray-400 border-white/5'
                            }`}>
                               {r.status || 'Ungraded'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <div className={`p-2 rounded-lg transition-transform ${expandedStudentId === r.studentId ? 'rotate-180 text-accent' : 'text-slate-800 group-hover:text-slate-500'}`}>
                                <ChevronDown size={20} />
                             </div>
                          </td>
                        </tr>

                        {expandedStudentId === r.studentId && (
                           <tr>
                             <td colSpan="6" className="px-8 py-0 border-b border-white/5 bg-slate-950/40">
                               <div className="py-8 space-y-8 animate-in slide-in-from-top-4 duration-500 px-4">
                                  {loadingDetails && !studentDetails[r.studentId] ? (
                                    <div className="flex flex-col items-center justify-center p-12 gap-4">
                                       <Loader2 className="animate-spin text-accent" size={24} />
                                       <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Parsing submission metadata...</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                       {(studentDetails[r.studentId] || []).map((q, qIndex) => (
                                          <div key={qIndex} className="space-y-4 bg-slate-950 p-6 rounded-3xl border border-white/5 hover:border-accent/20 transition-all">
                                             <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{q.questionTitle || `Question ${qIndex + 1}`}</h4>
                                                <span className={`text-[10px] font-bold ${q.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                   {q.passed ? 'PASSED' : 'FAILED'}
                                                </span>
                                             </div>
                                             <div className="space-y-1.5 font-mono">
                                                <div className="flex justify-between text-[9px]">
                                                   <span className="text-slate-600 uppercase">Input Code</span>
                                                   <span className="text-slate-400">Lines: {q.code?.split('\n').length || 0}</span>
                                                </div>
                                                <pre className="text-xs bg-slate-900/50 p-4 rounded-xl border border-white/5 text-slate-300 overflow-x-auto max-h-40 custom-scrollbar whitespace-pre-wrap leading-relaxed">
                                                   {q.code || 'No code submitted.'}
                                                </pre>
                                             </div>
                                             {q.error && (
                                                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                                   <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1 text-center italic">Compile Error</p>
                                                   <pre className="text-[10px] text-rose-300 whitespace-pre-wrap opacity-80">{q.error}</pre>
                                                </div>
                                             )}
                                          </div>
                                       ))}
                                    </div>
                                  )}
                               </div>
                             </td>
                           </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Space (1/3) */}
        <aside className="lg:col-span-4 space-y-8">
           {/* Test Statistics */}
           <div className="glass-card border border-white/5 shadow-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-accent">
                <Settings size={120} />
              </div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
                  <Clock size={20} className="text-accent" strokeWidth={2.5} />
                </div>
                <div>
                   <h3 className="text-[13px] font-black text-white uppercase tracking-widest leading-none">Test Details</h3>
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1">Summary & Settings</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-0.5">Time Limit</p>
                      <p className="text-xl font-bold text-white tracking-tight">{test?.duration || 0} <span className="text-[10px] text-gray-600">MIN</span></p>
                    </div>
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Marks</p>
                       <p className="text-xl font-black text-white">{totalMarks} <span className="text-[10px] text-gray-600">MARKS</span></p>
                    </div>
                 </div>
                 
                 <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pass Threshold (50%)</span>
                       <span className="text-xs font-black text-emerald-400">{(totalMarks * 0.5).toFixed(1)} Pts</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500/40 w-1/2"></div>
                    </div>
                 </div>

                 <div className="pt-2 border-t border-white/5 space-y-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Access Link</p>
                       <p className="text-[11px] font-bold text-slate-300 font-mono truncate bg-slate-950 p-2 rounded-lg border border-white/5">{testLink}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Test QR Code */}
           <div className="glass-card border border-white/5 shadow-2xl p-8 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-8 w-full border-b border-white/5 pb-4">
                 <QrCode size={18} className="text-accent" />
                 <h3 className="text-[12px] font-black text-white uppercase tracking-widest">QR Access</h3>
              </div>
              
              <div className="p-5 bg-white rounded-[28px] shadow-xl group hover:scale-[1.02] transition-transform duration-500">
                <QRCode value={testLink} size={150} level="H" fgColor="#000000" />
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                 <button onClick={copyTestLink} className="flex-1 bg-white/3 hover:bg-white/8 border border-white/5 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <Copy size={20} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Copy</span>
                 </button>
                 <button onClick={() => window.print()} className="flex-1 bg-white/3 hover:bg-white/8 border border-white/5 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <Share2 size={20} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Print</span>
                 </button>
              </div>
           </div>

           {/* Questions Overview */}
           <div className="glass-card border border-white/5 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-accent" />
                    <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Question Bank</h3>
                 </div>
                 <span className="bg-accent/10 text-accent text-[10px] font-black px-2.5 py-1 rounded-full">{questions.length}</span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2 text-white">
                 {questions.map((q, i) => (
                    <div key={q.id || i} className="group p-5 bg-slate-950 border border-white/5 rounded-2xl hover:border-accent/30 transition-all flex items-center justify-between cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-black text-slate-600 group-hover:text-white transition-colors">
                             {String(i + 1).padStart(2, '0')}
                          </div>
                          <div>
                             <p className="text-[12px] font-black text-white uppercase tracking-tight group-hover:text-accent transition-colors truncate max-w-30">{q.title}</p>
                             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{q.marks} PTS</p>
                          </div>
                       </div>
                       <ExternalLink size={14} className="text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </div>
                 ))}
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
};
