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
  CheckCircle,
  Settings,
  Loader2,
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
      const [questionsData, resultsData] = await Promise.all([
        teacherService.getTestQuestions(id),
        teacherService.getTestResults(id)
      ]);
      // Build a pseudo test object from the questions/results data
      const testMeta = {
        id,
        name: questionsData?.[0]?.testName || `Test ${id.slice(0,8)}`,
        duration: questionsData?.[0]?.testDuration || 60,
        createdAt: new Date().toISOString(),
        startTime: null,
        endTime: null,
      };
      setTest(testMeta);
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
      className={`px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-white/[0.05] transition-colors select-none ${align === 'center' ? 'text-center' : 'text-left'}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : ''}`}>
        {label}
        <span className={`text-[10px] flex flex-col -space-y-1 ${sortConfig.key === sortKey ? 'text-[#2df07b]' : 'text-gray-700'}`}>
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2df07b]"></div>
    </div>
  );

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const averageAccuracy = results.length > 0
    ? results.reduce((sum, r) => sum + (r.overallAccuracy || 0), 0) / results.length
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button onClick={() => navigate('/teacher')} className="flex items-center gap-2 text-slate-500 hover:text-[#2df07b] font-bold text-xs uppercase tracking-widest transition-colors mb-4 group">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
          </button>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Test <span className="text-[#2df07b]">Detail</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium italic opacity-80">{test.name}</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
              onClick={() => navigate(`/teacher/monitor/${id}`)}
              className="flex items-center gap-3 bg-black border border-white/5 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-[#2df07b] hover:bg-[#2df07b]/5 transition-all shadow-xl group"
            >
              <Layout size={18} className="text-[#2df07b] group-hover:scale-110 transition-transform" />
              Live Monitor
            </button>
            <button 
              onClick={copyTestLink}
              className="flex items-center gap-3 bg-[#2df07b] text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(45,240,123,0.3)]"
            >
              <Share2 size={18} />
              Share Test
            </button>
        </div>
      </header>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Appeared', val: analytics.totalStudentsAppeared, color: 'emerald', icon: Users, desc: 'Active Participants' },
          { label: 'Completed', val: analytics.totalStudentsCompleted, color: 'blue', icon: BarChart3, desc: 'Final Submissions' },
          { label: 'Passed', val: analytics.totalStudentsPassed, color: 'emerald', icon: CheckCircle, desc: 'Above Threshold' },
          { label: 'Failed', val: analytics.totalStudentsFailed, color: 'rose', icon: XCircle, desc: 'Needs Review' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border border-slate-800/50 hover:border-slate-700 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110">
               <stat.icon size={100} className={`text-${stat.color}-400`} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 shadow-lg`}>
                <stat.icon size={18} className={`text-${stat.color}-400`} strokeWidth={2.5} />
              </div>
              <span className="text-slate-500 text-[11px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <div>
              <p className="text-4xl font-black text-white leading-none tracking-tighter">{stat.val || 0}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tight italic opacity-60 flex items-center gap-1.5">
                 <div className={`w-1 h-1 rounded-full bg-${stat.color}-500`}></div> {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content: Results Table */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2df07b]/30 to-transparent"></div>
            
            <div className="px-8 py-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900/40">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#2df07b]/10 rounded-lg">
                   <Users size={18} className="text-[#2df07b]" />
                </div>
                <div>
                   <h2 className="text-[12px] font-black text-white uppercase tracking-widest">Student Results</h2>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">Total: <span className="text-[#2df07b]">{processedResults.length}</span> Submissions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    className="w-full sm:w-64 bg-slate-950 border border-white/5 rounded-xl text-[12px] font-bold text-white px-6 py-2.5 pl-11 focus:outline-none focus:border-[#2df07b]/50 transition-all placeholder:text-slate-800"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="FIND STUDENT..."
                  />
                </div>
                <button 
                  onClick={downloadResultsCSV} 
                  disabled={results.length === 0}
                  className="p-2.5 bg-[#2df07b]/10 text-[#2df07b] border border-[#2df07b]/20 hover:bg-[#2df07b] hover:text-black rounded-xl transition-all disabled:opacity-30"
                  title="Export Data"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-5 w-10"></th>
                    <SortHeader label="STUDENT NAME" sortKey="studentName" />
                    <SortHeader label="SUBMISSION" sortKey="submissionStatus" align="center" />
                    <SortHeader label="SCORE" sortKey="totalScore" />
                    <SortHeader label="ACCURACY" sortKey="overallAccuracy" />
                    <SortHeader label="STATUS" sortKey="status" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {processedResults.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center">
                         <div className="flex flex-col items-center gap-4 opacity-40">
                            <Users size={40} className="text-slate-700" strokeWidth={1} />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-600">No submissions found.</p>
                         </div>
                      </td>
                    </tr>
                  ) : (
                    processedResults.map((r) => (
                      <React.Fragment key={r.studentId}>
                          <tr 
                              className={`hover:bg-white/[0.02] cursor-pointer transition-all group ${expandedStudentId === r.studentId ? 'bg-[#2df07b]/5' : ''}`}
                              onClick={() => toggleStudentExpansion(r.studentId)}
                          >
                            <td className="px-6 py-5">
                               <div className={`p-1 rounded transition-colors ${expandedStudentId === r.studentId ? 'text-[#2df07b]' : 'text-slate-600'}`}>
                                  {expandedStudentId === r.studentId ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                               </div>
                            </td>
                            <td className="px-6 py-5">
                              <p className="text-white font-black text-sm uppercase tracking-tight group-hover:text-[#2df07b] transition-colors">{r.studentName}</p>
                              <p className="text-slate-600 text-[10px] font-bold tracking-tighter mt-0.5">{r.studentEmail}</p>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${r.submissionStatus === 'SUBMITTED' ? 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'}`}>
                                {r.submissionStatus === 'SUBMITTED' ? 'Submitted' : 'In Progress'}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-mono text-white font-black text-sm tracking-tighter">
                              {r.totalScore?.toFixed(1)} <span className="text-slate-700 text-[11px] font-bold">/ {totalMarks}</span>
                            </td>
                            <td className="px-6 py-5 font-mono text-slate-400 font-bold text-sm tracking-tighter">
                              {r.overallAccuracy?.toFixed(1)}%
                            </td>
                            <td className="px-6 py-5">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border flex items-center justify-center w-24 gap-1.5 ${r.status === 'Pass' || r.status === 'Passed' ? 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                {r.status === 'Pass' || r.status === 'Passed' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                {r.status}
                              </span>
                            </td>
                          </tr>
                          
                          {/* Expanded Details Row */}
                          {expandedStudentId === r.studentId && (
                            <tr className="bg-slate-950/40">
                              <td colSpan="6" className="p-0 border-l-[3px] border-[#2df07b]">
                                  <div className="p-8">
                                      <div className="flex items-center gap-3 mb-6">
                                         <div className="w-1.5 h-1.5 rounded-full bg-[#2df07b] shadow-[0_0_8px_rgba(45,240,123,0.8)] animate-pulse"></div>
                                         <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Question Breakdown</h4>
                                      </div>
                                      
                                      {loadingDetails && !studentDetails[r.studentId] ? (
                                          <div className="flex items-center gap-3 py-4 text-slate-500">
                                              <Loader2 className="animate-spin h-4 w-4 text-[#2df07b]" />
                                              <span className="text-[10px] font-black uppercase tracking-widest">Loading results...</span>
                                          </div>
                                      ) : !studentDetails[r.studentId] || studentDetails[r.studentId].length === 0 ? (
                                          <div className="text-[11px] text-slate-700 italic font-medium p-4 border border-dashed border-slate-800 rounded-2xl">No data found for this student.</div>
                                      ) : (
                                          <div className="grid gap-3">
                                              {studentDetails[r.studentId].map(detail => (
                                                  <div key={detail.submissionId} className="bg-slate-950 border border-white/5 p-5 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group/q">
                                                      <div className="flex items-center gap-4">
                                                         <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-700 group-hover/q:text-[#2df07b] transition-colors">
                                                            {detail.questionTitle.charAt(0)}
                                                         </div>
                                                         <div>
                                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{detail.questionTitle}</p>
                                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter mt-1 italic">
                                                              {new Date(detail.submissionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • SUBMITTED
                                                            </p>
                                                         </div>
                                                      </div>
                                                      <div className="flex items-center gap-12 text-right">
                                                         <div>
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-0.5">Accuracy</p>
                                                            <p className="text-sm font-mono text-slate-400 font-bold">{detail.accuracy}%</p>
                                                         </div>
                                                         <div className="w-20">
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-0.5">Points</p>
                                                            <p className="text-sm font-mono text-white font-bold">{detail.score?.toFixed(1)}</p>
                                                         </div>
                                                         <div className="w-24 flex flex-col items-end">
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-0.5">Status</p>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${detail.status === 'Pass' || detail.status === 'Passed' ? 'text-[#2df07b] border-[#2df07b]/20 bg-[#2df07b]/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'}`}>
                                                              {detail.status}
                                                            </span>
                                                         </div>
                                                      </div>
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
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Settings size={120} className="text-purple-400" />
              </div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Clock size={20} className="text-purple-400" strokeWidth={2.5} />
                </div>
                <div>
                   <h3 className="text-[13px] font-black text-white uppercase tracking-widest leading-none">Test Details</h3>
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1">Summary & Settings</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Time Limit</p>
                       <p className="text-xl font-black text-white">{test.duration} <span className="text-[10px] text-slate-600">MINS</span></p>
                    </div>
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Marks</p>
                       <p className="text-xl font-black text-white">{totalMarks} <span className="text-[10px] text-slate-600">MARKS</span></p>
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
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Link Active</p>
                       <p className="text-[11px] font-bold text-slate-300 font-mono truncate bg-slate-950 p-2 rounded-lg border border-white/5">{testLink}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className={`p-1.5 rounded-lg border flex items-center gap-2 ${timeLeft.includes('Ended') ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 'bg-[#2df07b]/5 border-[#2df07b]/20 text-[#2df07b]'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${timeLeft.includes('Ended') ? 'bg-rose-500' : 'bg-[#2df07b] animate-pulse'}`}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{timeLeft || 'CALCULATING...'}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Test QR Code */}
           <div className="glass-card border border-white/5 shadow-2xl p-8 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-8 w-full border-b border-white/5 pb-4">
                 <QrCode size={18} className="text-[#2df07b]" />
                 <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Test Link & QR Code</h3>
              </div>
              
              <div className="p-5 bg-white rounded-[28px] shadow-[0_0_50px_rgba(255,255,255,0.08)] group hover:scale-[1.02] transition-transform duration-500">
                <QRCode value={testLink} size={150} level="H" fgColor="#000000" />
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                 <button onClick={copyTestLink} className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <Copy size={20} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Copy Link</span>
                 </button>
                 <button onClick={() => window.print()} className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <Share2 size={20} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Print Page</span>
                 </button>
              </div>
           </div>

           {/* Questions Overview */}
           <div className="glass-card border border-white/5 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-[#2df07b]" />
                    <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Questions List</h3>
                 </div>
                 <span className="bg-[#2df07b]/10 text-[#2df07b] text-[10px] font-black px-2.5 py-1 rounded-full">{questions.length} Questions</span>
              </div>
              <div className="space-y-3">
                 {questions.map((q, i) => (
                   <div key={q.questionId || q.id || i} className="group p-5 bg-slate-950 border border-white/5 rounded-2xl hover:border-[#2df07b]/30 transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-black text-slate-600 group-hover:text-white transition-colors">
                            {String(i + 1).padStart(2, '0')}
                         </div>
                         <div>
                            <p className="text-[12px] font-black text-white uppercase tracking-tight group-hover:text-[#2df07b] transition-colors">{q.title}</p>
                            <div className="flex items-center gap-3 mt-1.5 opacity-50">
                               <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{q.marks} PTS</span>
                               <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                               <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{q.difficulty || 'STD'}</span>
                            </div>
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
