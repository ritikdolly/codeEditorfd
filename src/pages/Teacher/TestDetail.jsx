import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacherService } from '../../services/api';
import QRCode from 'react-qr-code';
import { Clock, Copy, QrCode, BookOpen, Download, UserCircle, ChevronDown, ChevronRight, Users, Eye, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const difficultyColor = { EASY: 'badge-green', MEDIUM: 'text-yellow-400 bg-yellow-500/10', HARD: 'badge-red' };

export function TestDetail() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]); 
  const [analytics, setAnalytics] = useState(null);
  
  // States for expandable rows
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState({}); // { studentId: [SubmissionReportDto] }
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [filterQuery, setFilterQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'desc' });

  const testLink = `${window.location.origin}/student/test/${id}`;

  useEffect(() => {
    teacherService.getTests()
      .then(tests => {
        const found = tests.find(t => t.id === id);
        setTest(found || null);
      })
      .catch(console.error);

    teacherService.getTestQuestions(id)
      .then(setQuestions)
      .catch(err => toast.error('Could not load test questions'));

    teacherService.getTestResults(id)
      .then(data => {
        // Sorting results by total score descending as a default for results
        const sortedResults = [...data].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
        setResults(sortedResults);
      })
      .catch(err => console.error("Could not load results", err));

    teacherService.getTestAnalytics(id)
      .then(setAnalytics)
      .catch(err => console.error("Could not load analytics", err));
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(testLink);
    toast.success('Test link copied!');
  };

  const toggleStudentExpansion = async (studentId) => {
    if (expandedStudentId === studentId) {
        setExpandedStudentId(null);
        return;
    }
    
    setExpandedStudentId(studentId);
    
    // Fetch details if we don't already have them
    if (!studentDetails[studentId]) {
      setLoadingDetails(true);
      try {
        const details = await teacherService.getStudentTestDetails(id, studentId);
        // Sort individual student question submissions by time descending (newest first)
        const sortedDetails = [...details].sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime));
        setStudentDetails(prev => ({ ...prev, [studentId]: sortedDetails }));
      } catch (err) {
        toast.error('Failed to load student question details');
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
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
    link.setAttribute("download", `${test.name.replace(/\s+/g, '_')}_Aggregated_Results.csv`);
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

  if (!test) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  );

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

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{test.name}</h1>
        <p className="text-slate-400 mt-1">Test configuration, QR Code, and Student Results</p>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        {[
          { label: 'Appeared', val: analytics?.totalStudentsAppeared, color: 'purple', icon: Eye, desc: 'Active' },
          { label: 'Completed', val: analytics?.totalStudentsCompleted, color: 'amber', icon: BarChart3, desc: 'Finished' },
          { label: 'Passed', val: analytics?.totalStudentsPassed, color: 'emerald', icon: CheckCircle, desc: 'Success' },
          { label: 'Failed', val: analytics?.totalStudentsFailed, color: 'rose', icon: XCircle, desc: 'Review' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 border border-slate-700/50 hover:border-slate-500 transition-all group overflow-hidden relative">
            <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`}>
               <stat.icon size={60} className={`text-${stat.color}-400`} />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                <stat.icon size={14} className={`text-${stat.color}-400`} />
              </div>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white leading-none">{stat.val || 0}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-tighter italic opacity-60">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Test Info & QR Code */}
        <div className="space-y-6 col-span-1">
          {/* QR Code Card */}
          <div className="glass-card p-6 flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-purple-400" />
              <h2 className="text-base font-semibold text-white">Share with Students</h2>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <QRCode value={testLink} size={150} />
            </div>

            <p className="text-slate-400 text-sm text-center">Scan QR or share link</p>

            <div className="w-full flex items-center gap-2">
              <div className="flex-1 bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono truncate">
                {testLink}
              </div>
              <button onClick={copyLink} className="btn-secondary px-3 py-2 shrink-0" title="Copy link">
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Test Info */}
          <div className="glass-card p-6 border border-slate-700/50 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700/30">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Clock size={18} className="text-purple-400" />
              </div>
              <span className="text-white font-black text-sm uppercase tracking-widest">Protocol Stats</span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Timeline</p>
                <p className="text-white text-sm font-bold">{test.duration} Mins</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Budget</p>
                <p className="text-white text-sm font-bold">{totalMarks} Marks</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Pass Threshold (50%)</p>
                <p className="text-emerald-400 text-sm font-bold">{(totalMarks * 0.5).toFixed(1)} Marks</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Window Open</p>
                <p className="text-white text-xs font-medium font-mono">
                  {test.startTime ? new Date(test.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                </p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Window Close</p>
                <p className="text-white text-xs font-medium font-mono">
                  {test.endTime ? new Date(test.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                </p>
              </div>
            </div>

            {timeLeft && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950/50 border border-purple-500/20 text-center shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-80">Syncing Countdown</p>
                <p className="text-white text-2xl font-black font-mono tracking-tight">{timeLeft}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Questions & Results */}
        <div className="col-span-2 space-y-6">
          
          {/* Questions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Questions Assortment</h2>
            </div>
            {questions.length === 0 ? (
              <div className="glass-card p-6 text-center text-slate-500 text-sm">No questions added yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questions.map((q, i) => (
                  <div key={q.id} className="glass-card p-3 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-purple-600/20 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{q.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-xs">{q.marks} marks</span>
                        <span className={`badge ${difficultyColor[q.difficulty] || 'badge-blue'} text-[10px] px-1.5 py-0`}>
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results Table */}
          <div className="space-y-3 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <UserCircle size={18} className="text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Student Submissions</h2>
                <span className="badge badge-purple ml-2">{processedResults.length}</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  placeholder="Search students or status..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-purple-500 transition-colors w-56 placeholder:text-slate-500"
                />
                <button onClick={downloadResultsCSV} disabled={results.length === 0}
                  className="btn-primary flex items-center gap-2 py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20">
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/40 border-b border-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 font-medium w-10"></th>
                      <SortHeader label="Student" sortKey="studentName" />
                      <SortHeader label="Submission Status" sortKey="submissionStatus" align="center" />
                      <SortHeader label="Total Score" sortKey="totalScore" />
                      <SortHeader label="Overall Accuracy" sortKey="overallAccuracy" />
                      <SortHeader label="Evaluation" sortKey="status" />
                    </tr>
                  </thead>
                  <tbody>
                    {processedResults.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                          {results.length > 0 ? "No students match your search." : "No student submissions recorded yet."}
                        </td>
                      </tr>
                    ) : (
                      processedResults.map((r, idx) => (
                        <React.Fragment key={r.studentId}>
                            <tr 
                                className={`border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer transition-colors ${expandedStudentId === r.studentId ? 'bg-slate-700/10' : ''}`}
                                onClick={() => toggleStudentExpansion(r.studentId)}
                            >
                              <td className="px-4 py-3 text-slate-400">
                                {expandedStudentId === r.studentId ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-white font-medium truncate max-w-[150px]">{r.studentName}</p>
                                <p className="text-slate-400 text-xs truncate max-w-[150px]">{r.studentEmail}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${r.submissionStatus === 'SUBMITTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                  {r.submissionStatus === 'SUBMITTED' ? 'Submitted' : 'Appeared'}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-white">
                                {r.totalScore?.toFixed(1)} <span className="text-slate-500 text-xs">/ {totalMarks}</span>
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-300">
                                {r.overallAccuracy?.toFixed(1)}%
                              </td>
                              <td className="px-4 py-3">
                                <span className={`badge ${r.status === 'Pass' || r.status === 'Passed' ? 'badge-green' : 'badge-red'} text-xs`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                            
                            {/* Expanded Details Row */}
                            {expandedStudentId === r.studentId && (
                              <tr className="bg-slate-900/50 border-b border-slate-700/30">
                                <td colSpan="5" className="p-0">
                                    <div className="p-4 pl-12 border-l-2 border-purple-500/50">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Question Breakdown</h4>
                                        
                                        {loadingDetails && !studentDetails[r.studentId] ? (
                                            <div className="text-sm text-slate-400 flex items-center gap-2">
                                                <div className="animate-spin h-3 w-3 border-b-2 border-purple-500 rounded-full"></div>
                                                Loading details...
                                            </div>
                                        ) : !studentDetails[r.studentId] || studentDetails[r.studentId].length === 0 ? (
                                            <div className="text-sm text-slate-500">No question details found.</div>
                                        ) : (
                                            <table className="w-full text-xs text-left">
                                                <thead className="text-slate-500 border-b border-slate-700/50">
                                                    <tr>
                                                        <th className="pb-2 font-medium">Question</th>
                                                        <th className="pb-2 font-medium">Score</th>
                                                        <th className="pb-2 font-medium">Accuracy</th>
                                                        <th className="pb-2 font-medium">Status</th>
                                                        <th className="pb-2 font-medium">Submitted</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/50">
                                                    {studentDetails[r.studentId].map(detail => (
                                                        <tr key={detail.submissionId} className="hover:bg-slate-800/30">
                                                            <td className="py-2 text-slate-300">{detail.questionTitle}</td>
                                                            <td className="py-2 font-mono text-slate-300">{detail.score?.toFixed(1)}</td>
                                                            <td className="py-2 font-mono text-slate-400">{detail.accuracy}%</td>
                                                            <td className="py-2">
                                                                <span className={detail.status === 'Pass' || detail.status === 'Passed' ? 'text-emerald-400' : 'text-rose-400'}>
                                                                    {detail.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 text-slate-500">
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
          </div>

        </div>
      </div>

      <div className="pt-4 border-t border-slate-700/50">
        <Link to="/teacher" className="btn-secondary text-sm">← Back to Dashboard</Link>
      </div>
    </div>
  );
}
