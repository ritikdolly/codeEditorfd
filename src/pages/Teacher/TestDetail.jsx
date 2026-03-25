import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { teacherService } from "../../services/api";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Trophy,
  ArrowLeft,
  Share2,
  Calendar,
  ExternalLink,
  Search,
  BookOpen,
  Download,
  Eye,
  QrCode,
  Settings,
  Loader2,
  ShieldCheck,
  Filter,
  RefreshCcw,
  Beaker,
  Code,
} from "lucide-react";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import { QuestionDetailModal } from "../../components/teacher/QuestionDetailModal";

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
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "studentName",
    direction: "asc",
  });
  const [filterQuery, setFilterQuery] = useState("");
  
  const totalMarks = useMemo(() => questions.reduce((sum, q) => sum + (q.marks || 0), 0), [questions]);

  const testLink = `${window.location.origin}/student/test/${id}`;

  const copyTestLink = () => {
    navigator.clipboard.writeText(testLink);
    toast.success("Test link copied to clipboard!");
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
        teacherService.getTest(id),
      ]);
      setTest(testData);
      setQuestions(questionsData || []);
      setResults(resultsData || []);
    } catch (error) {
      toast.error("Failed to load test data");
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
        const details = await teacherService.getStudentTestDetails(
          id,
          studentId,
        );
        setStudentDetails((prev) => ({ ...prev, [studentId]: details }));
      } catch (error) {
        toast.error("Failed to load student details");
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const processedResults = useMemo(() => {
    let filtered = results;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      filtered = results.filter(
        (r) =>
          r.studentName?.toLowerCase().includes(q) ||
          r.studentEmail?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q) ||
          r.submissionStatus?.toLowerCase().includes(q),
      );
    }

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "studentName" || sortConfig.key === "submissionStatus") {
        aVal = aVal?.toLowerCase() || "";
        bVal = bVal?.toLowerCase() || "";
      }

      if (aVal === undefined || aVal === null)
        return sortConfig.direction === "asc" ? -1 : 1;
      if (bVal === undefined || bVal === null)
        return sortConfig.direction === "asc" ? 1 : -1;

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [results, sortConfig, filterQuery]);

  const analytics = useMemo(() => {
    return {
      totalStudentsRegistered: results.length,
      totalStudentsAppeared: results.filter(
        (r) => r.submissionStatus === "SUBMITTED" || r.status !== "NOT_STARTED",
      ).length,
      totalStudentsCompleted: results.filter(
        (r) => r.submissionStatus === "SUBMITTED",
      ).length,
      totalStudentsPassed: results.filter(
        (r) => r.status === "Pass" || r.status === "Passed",
      ).length,
      totalStudentsFailed: results.filter(
        (r) => r.status === "Fail" || r.status === "Failed",
      ).length,
    };
  }, [results]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortHeader = ({ label, sortKey, align = "left" }) => (
    <th
      className={`px-6 py-6 cursor-pointer hover:bg-white/10 transition-all group ${align === "center" ? "text-center" : "text-left"}`}
      onClick={() => handleSort(sortKey)}
    >
      <div
        className={`flex items-center gap-2 ${align === "center" ? "justify-center" : "justify-start"}`}
      >
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 group-hover:text-accent transition-colors uppercase">
          {label}
        </span>
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronUp
            size={10}
            className={`-mb-1 ${sortConfig.key === sortKey && sortConfig.direction === "asc" ? "text-accent" : "text-slate-700"}`}
          />
          <ChevronDown
            size={10}
            className={`${sortConfig.key === sortKey && sortConfig.direction === "desc" ? "text-accent" : "text-slate-700"}`}
          />
        </div>
      </div>
    </th>
  );

  const downloadResultsCSV = () => {
    if (!results.length) {
      toast.error("No results to download");
      return;
    }
    const headers = [
      "Student Name",
      "Email",
      "Total Score",
      "Overall Accuracy (%)",
      "Status",
    ];
    const rows = results.map((r) =>
      [
        `"${r.studentName}"`,
        `"${r.studentEmail}"`,
        r.totalScore?.toFixed(1) || "0",
        r.overallAccuracy?.toFixed(1) || "0",
        r.status,
      ].join(","),
    );

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    const averageAccuracy = results.length > 0
    ? results.reduce((sum, r) => sum + (r.overallAccuracy || 0), 0) / results.length
    : 0;

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${(test?.name || "test").replace(/\s+/g, "_")}_Results.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Download started");
  };

  const [timeLeft, setTimeLeft] = useState("");

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
        setTimeLeft("Test Ended");
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
    return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
  };

  if (loading || !test)
    return (
      <div className="p-6 flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );

  // const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/5 relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <button
            onClick={() => navigate("/teacher")}
            className="flex items-center gap-2 text-slate-500 hover:text-accent font-bold text-[10px] uppercase tracking-[0.2em] transition-all mb-6 group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-linear-to-br from-accent to-accent-dark shadow-xl shadow-accent/20 ring-1 ring-white/20">
              <ShieldCheck className="text-black" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-accent/60 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Assessment Report
                </span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                {test?.name || "Loading Test..."}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">ID:</span>
              <span className="text-slate-200 text-xs font-mono font-bold">{test?.id?.slice(0, 12)}</span>
            </div>
            
            {timeLeft && (
              <div
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeLeft.includes("Ended") 
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                    : "bg-accent/10 border-accent/20 text-accent shadow-lg shadow-accent/5"
                }`}
              >
                <Clock
                  size={14}
                  className={timeLeft.includes("Ended") ? "text-rose-500" : "text-accent animate-pulse"}
                />
                {timeLeft}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={copyTestLink}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            <Copy size={18} className="text-accent" />
            Copy Access Link
          </button>
          <button
            className="flex items-center gap-3 bg-accent text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-accent/30"
            onClick={() => window.open(testLink, '_blank')}
          >
            <ExternalLink size={18} />
            Preview Test
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area (2/3) */}
        <div className="lg:col-span-8 space-y-12">
          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: "Total Registered",
                val: analytics.totalStudentsRegistered,
                icon: Users,
                color: "accent",
                desc: "Students opted-in"
              },
              {
                label: "Total Attempts",
                val: analytics.totalStudentsAppeared,
                icon: Trophy,
                color: "blue",
                desc: "Current progress"
              },
              {
                label: "Pass",
                val: analytics.totalStudentsPassed,
                icon: CheckCircle2,
                color: "emerald",
                desc: "Above threshold"
              },
              {
                label: "Fail",
                val: analytics.totalStudentsFailed,
                icon: XCircle,
                color: "rose",
                desc: "Below threshold"
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-card p-6 border border-white/5 flex flex-col gap-6 relative overflow-hidden group hover:border-accent/30 transition-all duration-500 hover:-translate-y-1 shadow-2xl"
              >
                <div
                  className={`absolute -right-4 -bottom-4 opacity-5 scale-150 rotate-12 group-hover:scale-[1.8] group-hover:opacity-10 transition-all duration-700 ${
                    stat.color === "accent" ? "text-accent" : `text-${stat.color}-400`
                  }`}
                >
                  <stat.icon size={80} />
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className={`p-2 rounded-xl ${stat.color === 'accent' ? 'bg-accent/10' : `bg-${stat.color}-500/10`}`}>
                    <stat.icon
                      size={18}
                      className={stat.color === "accent" ? "text-accent" : `text-${stat.color}-400`}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    {stat.label}
                  </span>
                </div>

                <div className="relative z-10">
                  <p className="text-4xl font-black text-white mb-1 tracking-tighter">{stat.val}</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">{stat.desc}</p>
                </div>
                
                <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${stat.color === 'accent' ? 'bg-accent w-0 group-hover:w-full' : `bg-${stat.color}-500 w-0 group-hover:w-full opacity-50`}`}></div>
              </div>
            ))}
          </div>

          {/* Filters & Students Table */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 bg-white/2 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-96 group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Filter by name, email, or status..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-hidden focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-slate-600 font-medium"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </div>
                <button className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Filter size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadResultsCSV}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg overflow-hidden group"
                >
                  <Download size={16} className="text-accent group-hover:translate-y-0.5 transition-transform" />
                  Export Results
                </button>
                <button
                  onClick={() => {
                    setFilterQuery("");
                    setSortConfig({ key: "studentName", direction: "asc" });
                    setExpandedStudentId(null);
                    setStudentDetails({});
                    fetchTestData();
                    toast.success("View refreshed and reset");
                  }}
                  className="flex items-center gap-2.5 bg-white/2 hover:bg-white/5 text-slate-500 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <RefreshCcw size={16} />
                  Reset
                </button>
              </div>
            </div>

            <div className="glass-card border border-white/5 overflow-x-auto rounded-3xl shadow-2xl custom-scrollbar">
              <table className="w-full text-left bg-slate-900/40 min-w-225">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 uppercase select-none">
                    <th className="px-6 py-6 w-10"></th>
                    <SortHeader label="Student" sortKey="studentName" />
                    <SortHeader label="Submission Status" sortKey="submissionStatus" align="center" />
                    <SortHeader
                      label="Score"
                      sortKey="totalScore"
                      align="center"
                    />
                    <SortHeader
                      label="Accuracy"
                      sortKey="overallAccuracy"
                      align="center"
                    />
                    <SortHeader
                      label="Evaluation"
                      sortKey="status"
                      align="center"
                    />
                    <th className="px-6 py-6 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2">
                  {processedResults.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-600 italic font-bold uppercase tracking-widest"
                      >
                        Zero students found matching this criteria
                      </td>
                    </tr>
                  ) : (
                    processedResults.map((r) => (
                      <React.Fragment key={r.studentId}>
                        <tr
                          className={`hover:bg-white/1 transition-all cursor-pointer group ${expandedStudentId === r.studentId ? "bg-accent/5" : ""}`}
                          onClick={() => toggleStudentExpansion(r.studentId)}
                        >
                          <td className="px-6 py-5">
                            <div
                              className={`p-1 rounded transition-colors ${expandedStudentId === r.studentId ? "text-accent" : "text-slate-600"}`}
                            >
                              {expandedStudentId === r.studentId ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-slate-600 group-hover:text-accent transition-colors">
                                {r.studentName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight">
                                  {r.studentName}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 truncate max-w-40 group-hover:text-slate-300 transition-colors">
                                  {r.studentEmail}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            {(() => {
                              const isEnded = test?.endTime && new Date() > new Date(test.endTime);
                              const isSubmitted = r.submissionStatus === 'SUBMITTED';
                              
                              let statusText = r.submissionStatus || 'APPEARED';
                              let statusColor = isSubmitted ? 'emerald' : 'amber';
                              
                              if (isEnded && !isSubmitted) {
                                statusText = 'AUTO SUBMITTED';
                                statusColor = 'emerald';
                              }
                              
                              return (
                                <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                  statusColor === 'emerald' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 
                                  statusColor === 'rose' ? 'border-rose-500/20 bg-rose-500/10 text-rose-500' : 
                                  'border-amber-500/20 bg-amber-500/10 text-amber-500'
                                }`}>
                                    {statusText}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-5 text-center font-bold font-mono text-white text-base">
                             {r.totalScore?.toFixed(1) || 0} <span className="text-gray-600 text-[10px] font-black">/ {totalMarks}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-black text-white">
                               {r.overallAccuracy?.toFixed(1) || 0}%
                              </span>
                              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">accuracy</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span
                              className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                r.status === "Pass" || r.status === "Passed"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                                  : r.status === "Fail" || r.status === "Failed"
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-500/5"
                                    : "bg-white/5 text-gray-400 border-white/5"
                              }`}
                            >
                              {r.status || "Ungraded"}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div
                              className={`p-2 rounded-lg transition-transform ${expandedStudentId === r.studentId ? "rotate-180 text-accent" : "text-slate-800 group-hover:text-slate-500"}`}
                            >
                              <ChevronDown size={20} />
                            </div>
                          </td>
                        </tr>

                        {expandedStudentId === r.studentId && (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-8 py-0 border-b border-white/5 bg-slate-950/40"
                            >
                              <div className="py-2 space-y-2 animate-in slide-in-from-top-4 duration-500 px-4">
                                {loadingDetails &&
                                !studentDetails[r.studentId] ? (
                                  <div className="flex flex-col items-center justify-center p-12 gap-4">
                                    <Loader2
                                      className="animate-spin text-accent"
                                      size={24}
                                    />
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                      Parsing submission metadata...
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-6 pb-1">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Question Breakdown</h3>
                                    <div className="glass-card border border-white/5 overflow-hidden rounded-2xl">
                                      <table className="w-full text-left bg-slate-900/40">
                                        <thead>
                                          <tr className="border-b border-white/5 bg-white/2">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Question</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Score</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Accuracy</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Submitted</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/2">
                                           {(studentDetails[r.studentId] || []).map((detail, qIndex) => {
                                             const targetQuestion = questions.find(question => 
                                               (question.id && detail.questionId && question.id === detail.questionId) || 
                                               (question.title && detail.questionTitle && question.title === detail.questionTitle)
                                             );
                                             const questionMarks = targetQuestion ? targetQuestion.marks : 10;
                                             const isPassed = detail.passed || detail.accuracy === 100 || (detail.score || 0) >= questionMarks;
                                             
                                             return (
                                               <tr key={qIndex} className="hover:bg-white/2 transition-colors group/q border-b border-white/2 last:border-0 text-white">
                                                 <td className="px-6 py-5">
                                                   <div className="flex flex-col">
                                                     <p className="text-sm font-black text-white uppercase tracking-tight group-hover/q:text-accent transition-colors">
                                                       {detail.questionTitle || `Question ${qIndex + 1}`}
                                                     </p>
                                                     <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                                                       {detail.questionType || 'CODING'}
                                                     </p>
                                                   </div>
                                                 </td>
                                                 <td className="px-6 py-5 text-center">
                                                   <div className="flex flex-col gap-1 items-center">
                                                     <span className="font-mono text-sm font-black text-white">
                                                      {detail.score?.toFixed(1)} <span className="text-slate-600">/ {questionMarks}</span>
                                                     </span>
                                                     <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">points</span>
                                                   </div>
                                                 </td>
                                                 <td className="px-6 py-5 text-center">
                                                   <div className="flex flex-col gap-0.5 items-center">
                                                     <span className="text-xs font-black text-slate-300">
                                                       {detail.accuracy}%
                                                     </span>
                                                     <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden mt-1 border border-white/5">
                                                       <div className={`h-full transition-all duration-700 ${detail.accuracy === 100 ? 'bg-emerald-500' : 'bg-accent/40'}`} style={{ width: `${detail.accuracy || 0}%` }}></div>
                                                     </div>
                                                   </div>
                                                  </td>
                                                  <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${detail.status === 'Pass' || detail.status === 'Passed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                       {detail.status}
                                                    </span>
                                                  </td>
                                                  <td className="px-6 py-5 text-right font-mono text-slate-600 text-[10px] font-bold">
                                                    {detail.submissionTime ? new Date(detail.submissionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                         </tbody>
                                       </table>
                                    </div>
                                    
                                    {/* Sub-expansion for code view */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
                                      {(studentDetails[r.studentId] || []).filter(q => q.code || q.testCaseResults).map((q, qIndex) => (
                                        <div key={`code-${qIndex}`} className="space-y-4 bg-slate-950/60 p-6 rounded-3xl border border-white/5 h-fit">
                                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                            <div className="flex flex-col">
                                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{q.questionTitle}</h4>
                                              <p className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">{q.questionType || 'CODING'}</p>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">submission detail</span>
                                          </div>
                                          
                                          {/* Code Snippet */}
                                          {q.code && (
                                            <div className="space-y-2">
                                              <div className="flex items-center gap-2">
                                                <Code size={12} className="text-accent" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Source Implementation</span>
                                              </div>
                                              <pre className="text-[11px] bg-slate-900/50 p-4 rounded-xl border border-white/5 text-slate-300 overflow-x-auto max-h-40 custom-scrollbar whitespace-pre-wrap leading-relaxed font-mono">
                                                {q.code}
                                              </pre>
                                            </div>
                                          )}

                                          {/* Error Message */}
                                          {q.error && (
                                            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1.5 animate-in slide-in-from-top-1 duration-300">
                                              <div className="flex items-center gap-2 text-rose-400">
                                                <XCircle size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Execution Failure</span>
                                              </div>
                                              <pre className="text-[10px] text-rose-300/80 whitespace-pre-wrap italic leading-snug font-mono">
                                                {q.error}
                                              </pre>
                                            </div>
                                          )}

                                          {/* Test Case Results */}
                                          {q.testCaseResults && q.testCaseResults.length > 0 && (
                                            <div className="space-y-3">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <Beaker size={12} className="text-accent" />
                                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Validation Metrics</span>
                                                </div>
                                                <span className="text-[8px] font-bold text-slate-700 bg-white/2 px-2 py-0.5 rounded border border-white/5 uppercase select-none">
                                                  {q.testCaseResults.filter(tc => tc.passed).length}/{q.testCaseResults.length} PASSED
                                                </span>
                                              </div>
                                              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                                {q.testCaseResults.map((tc, tcIdx) => (
                                                  <div key={tcIdx} className={`p-3 rounded-2xl border transition-all ${tc.passed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-[9px] font-black text-slate-600 uppercase">Case #{tcIdx + 1}</span>
                                                      {tc.passed ? (
                                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                                      ) : (
                                                        <XCircle size={12} className="text-rose-500" />
                                                      )}
                                                    </div>
                                                    <div className="space-y-2">
                                                      <div className="flex items-start gap-4">
                                                        <div className="flex-1">
                                                          <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest mb-1">Expected</p>
                                                          <div className="p-2 bg-slate-950/50 rounded-lg font-mono text-[9px] text-slate-400 border border-white/2 truncate">
                                                            {tc.expectedOutput || 'None'}
                                                          </div>
                                                        </div>
                                                        <div className="flex-1">
                                                          <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest mb-1">Actual</p>
                                                          <div className={`p-2 bg-slate-950/50 rounded-lg font-mono text-[9px] border border-white/2 truncate ${tc.passed ? 'text-emerald-500/70' : 'text-rose-400/80'}`}>
                                                            {tc.actualOutput || 'None'}
                                                          </div>
                                                        </div>
                                                      </div>
                                                      {tc.message && (
                                                        <p className="text-[8px] font-medium text-slate-500 italic mt-1 leading-tight border-t border-white/5 pt-1">
                                                          {tc.message}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
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
                <h3 className="text-[13px] font-black text-white uppercase tracking-widest leading-none">
                  Test Details
                </h3>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1">
                  Summary & Settings
                </p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-0.5">
                    Time Limit
                  </p>
                  <p className="text-xl font-bold text-white tracking-tight">
                    {test?.duration || 0}{" "}
                    <span className="text-[10px] text-gray-600">MIN</span>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Total Marks
                  </p>
                  <p className="text-xl font-black text-white">
                    {totalMarks}{" "}
                    <span className="text-[10px] text-gray-600">MARKS</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Pass Threshold (50%)
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    {(totalMarks * 0.5).toFixed(1)} Pts
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/40 w-1/2"></div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Access Link
                  </p>
                  <p className="text-[11px] font-bold text-slate-300 font-mono truncate bg-slate-950 p-2 rounded-lg border border-white/5">
                    {testLink}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test QR Code */}
          <div className="glass-card border border-white/5 shadow-2xl p-8 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-8 w-full border-b border-white/5 pb-4">
              <QrCode size={18} className="text-accent" />
              <h3 className="text-[12px] font-black text-white uppercase tracking-widest">
                QR Access
              </h3>
            </div>

            <div className="p-5 bg-white rounded-[28px] shadow-xl group hover:scale-[1.02] transition-transform duration-500">
              <QRCode value={testLink} size={150} level="H" fgColor="#000000" />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <button
                onClick={copyTestLink}
                className="flex-1 bg-white/3 hover:bg-white/8 border border-white/5 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all"
              >
                <Copy size={20} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Copy
                </span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-white/3 hover:bg-white/8 border border-white/5 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all"
              >
                <Share2 size={20} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Print
                </span>
              </button>
            </div>
          </div>

          {/* Questions Overview */}
          <div className="glass-card border border-white/5 shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-accent" />
                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">
                  Question Bank
                </h3>
              </div>
              <span className="bg-accent/10 text-accent text-[10px] font-black px-2.5 py-1 rounded-full">
                {questions.length}
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2 text-white">
              {questions.map((q, i) => (
                <div
                  key={q.id || i}
                  onClick={() => {
                    setSelectedQuestionId(q.id);
                    setIsQuestionModalOpen(true);
                  }}
                  className="group p-5 bg-slate-950 border border-white/5 rounded-2xl hover:border-accent/30 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-black text-slate-600 group-hover:text-white transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-white uppercase tracking-tight group-hover:text-accent transition-colors truncate max-w-30">
                        {q.title}
                      </p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
                        {q.marks} PTS
                      </p>
                    </div>
                  </div>
                  <ExternalLink
                    size={14}
                    className="text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      
      <QuestionDetailModal 
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        questionId={selectedQuestionId}
      />
    </div>
  );
};
