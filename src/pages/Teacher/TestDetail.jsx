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
  Download
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

  const totalPossibleMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const averageAccuracy = results.length > 0
    ? results.reduce((sum, r) => sum + (r.overallAccuracy || 0), 0) / results.length
    : 0;

  return (
    <div className="pb-20 relative z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="space-y-4">
             <button 
                onClick={() => navigate('/teacher')}
                className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#2df07b] transition-colors group"
             >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Return to Dashboard
             </button>
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#2df07b]/10 border border-[#2df07b]/20 flex items-center justify-center text-[#2df07b] shadow-[0_0_20px_rgba(45,240,123,0.1)]">
                   <Target size={28} />
                </div>
                <div>
                   <h1 className="text-4xl font-bold text-white tracking-tight uppercase">{test?.name}</h1>
                   <div className="flex items-center gap-6 mt-3">
                      <div className="flex items-center gap-2 text-gray-500">
                         <Calendar size={14} />
                         <span className="text-[11px] font-bold uppercase tracking-widest">{new Date(test?.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                         <Clock size={14} />
                         <span className="text-[11px] font-bold uppercase tracking-widest">{test?.duration} Minute Window</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/teacher/monitor/${id}`)}
              className="flex items-center gap-3 bg-black border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-[12px] uppercase tracking-widest hover:border-[#2df07b] hover:bg-[#2df07b]/5 transition-all shadow-xl group"
            >
              <Layout size={18} className="text-[#2df07b] group-hover:scale-110 transition-transform" />
              Live Monitor
            </button>
            <button 
              onClick={copyTestLink}
              className="flex items-center gap-3 bg-[#2df07b] text-black px-8 py-4 rounded-2xl font-bold text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(45,240,123,0.3)]"
            >
              <Share2 size={18} />
              Share Test
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[
             { label: 'Submissions', value: results.length, icon: Users, color: 'text-white' },
             { label: 'Avg Accuracy', value: `${Math.round(averageAccuracy)}%`, icon: Target, color: 'text-[#2df07b]' },
             { label: 'Max Marks', value: totalPossibleMarks, icon: Trophy, color: 'text-amber-400' },
             { label: 'Status', value: timeLeft || 'ACTIVE', icon: CheckCircle2, color: 'text-[#2df07b]' }
           ].map((stat, i) => (
             <div key={i} className="bg-[#111111] p-8 border border-white/5 rounded-[32px] transition-all hover:border-[#2df07b]/20 group shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                  <stat.icon size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <p className={`text-4xl font-bold ${stat.color} font-outfit uppercase tracking-tight`}>{stat.value}</p>
             </div>
           ))}
        </div>

        {/* Results Table */}
        <div className="bg-[#111111] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
          <div className="px-10 py-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-[#2df07b]" />
              <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">Student Submissions</h2>
              <span className="bg-[#2df07b]/10 text-[#2df07b] text-[10px] font-bold px-3 py-1 rounded-full">{processedResults.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  className="bg-black/40 border border-white/10 rounded-xl text-[12px] font-bold text-white px-5 py-2.5 pl-11 focus:outline-none focus:border-[#2df07b]/50 transition-all placeholder:text-gray-700 w-64"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Search students..."
                />
              </div>
              <button onClick={downloadResultsCSV} disabled={results.length === 0}
                className="flex items-center gap-2 bg-[#2df07b] hover:bg-[#25c464] text-black font-bold text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50">
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest w-10"></th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-center">Submission Status</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Score</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Accuracy</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {processedResults.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-gray-600 text-sm font-medium">
                      No student submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  processedResults.map((r) => (
                    <React.Fragment key={r.studentId}>
                        <tr 
                            className={`hover:bg-white/[0.01] cursor-pointer transition-all group ${expandedStudentId === r.studentId ? 'bg-white/[0.02]' : ''}`}
                            onClick={() => toggleStudentExpansion(r.studentId)}
                        >
                          <td className="px-6 py-5 text-gray-500">
                            {expandedStudentId === r.studentId ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-white font-bold text-sm">{r.studentName}</p>
                            <p className="text-gray-600 text-[11px] font-medium mt-0.5">{r.studentEmail}</p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${r.submissionStatus === 'SUBMITTED' ? 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {r.submissionStatus === 'SUBMITTED' ? 'Submitted' : 'In Progress'}
                            </span>
                          </td>
                          <td className="px-6 py-5 font-mono text-white font-bold">
                            {r.totalScore?.toFixed(1)} <span className="text-gray-600 text-xs">/ {totalPossibleMarks}</span>
                          </td>
                          <td className="px-6 py-5 font-mono text-gray-300 font-bold">
                            {r.overallAccuracy?.toFixed(1)}%
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${r.status === 'Pass' || r.status === 'Passed' ? 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Expanded Details Row */}
                        {expandedStudentId === r.studentId && (
                          <tr className="bg-black/20">
                            <td colSpan="6" className="p-0">
                                <div className="p-6 pl-16 border-l-2 border-[#2df07b]/30">
                                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Question Breakdown</h4>
                                    
                                    {loadingDetails && !studentDetails[r.studentId] ? (
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <div className="animate-spin h-3 w-3 border-b-2 border-[#2df07b] rounded-full"></div>
                                            Loading details...
                                        </div>
                                    ) : !studentDetails[r.studentId] || studentDetails[r.studentId].length === 0 ? (
                                        <div className="text-sm text-gray-600">No question details found.</div>
                                    ) : (
                                        <table className="w-full text-xs text-left">
                                            <thead className="text-gray-600 border-b border-white/5">
                                                <tr>
                                                    <th className="pb-3 font-bold text-[10px] uppercase tracking-widest">Question</th>
                                                    <th className="pb-3 font-bold text-[10px] uppercase tracking-widest">Score</th>
                                                    <th className="pb-3 font-bold text-[10px] uppercase tracking-widest">Accuracy</th>
                                                    <th className="pb-3 font-bold text-[10px] uppercase tracking-widest">Status</th>
                                                    <th className="pb-3 font-bold text-[10px] uppercase tracking-widest">Submitted</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.02]">
                                                {studentDetails[r.studentId].map(detail => (
                                                    <tr key={detail.submissionId} className="hover:bg-white/[0.01]">
                                                        <td className="py-3 text-gray-300 font-medium">{detail.questionTitle}</td>
                                                        <td className="py-3 font-mono text-white">{detail.score?.toFixed(1)}</td>
                                                        <td className="py-3 font-mono text-gray-400">{detail.accuracy}%</td>
                                                        <td className="py-3">
                                                            <span className={detail.status === 'Pass' || detail.status === 'Passed' ? 'text-[#2df07b]' : 'text-rose-400'}>
                                                                {detail.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-gray-500 font-mono">
                                                            {new Date(detail.submissionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

        {/* Access Protocol & Question sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Access Protocol */}
          <div className="bg-[#111111] border border-white/5 rounded-[40px] p-10 shadow-2xl space-y-8">
             <div className="flex items-center gap-3">
                <ExternalLink size={18} className="text-[#2df07b]" />
                <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Access Link</h3>
             </div>
             <div className="p-8 bg-black rounded-3xl border border-white/5 flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                   <QRCode 
                      value={testLink}
                      size={160}
                      fgColor="#000000"
                      level="H"
                   />
                </div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-8 text-center leading-relaxed">Scan QR code to open test link</p>
             </div>
             <button 
                onClick={copyTestLink}
                className="w-full py-4 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-[#2df07b] hover:bg-[#2df07b]/5 hover:border-[#2df07b]/30 transition-all flex items-center justify-center gap-2 group"
             >
                <Copy size={14} className="group-hover:scale-110 transition-transform" />
                Copy Test Link
             </button>
          </div>

          {/* Questions List */}
          <div className="bg-[#111111] border border-white/5 rounded-[40px] p-10 shadow-2xl">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <BookOpen size={18} className="text-[#2df07b]" />
                   <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Assigned Questions</h3>
                </div>
                <span className="bg-[#2df07b]/10 text-[#2df07b] text-[10px] font-bold px-3 py-1 rounded-full">{questions.length} Items</span>
             </div>
             <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.questionId || q.id || i} className="group cursor-pointer p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-[#2df07b]/30 transition-all">
                     <div className="flex items-start gap-4">
                        <span className="text-[10px] font-mono text-gray-700 font-bold mt-1">{String(i+1).padStart(2, '0')}</span>
                        <div className="flex-1">
                           <p className="text-[14px] font-bold text-white uppercase tracking-tight group-hover:text-[#2df07b] transition-colors">{q.title}</p>
                           <div className="flex items-center gap-4 mt-2">
                              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{q.marks} Marks</span>
                              <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{q.difficulty || 'Standard'}</span>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
