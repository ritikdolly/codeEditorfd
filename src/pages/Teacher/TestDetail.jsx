import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { teacherService } from "../../services/api";
import QRCode from "react-qr-code";
import {
  Clock,
  Copy,
  QrCode,
  BookOpen,
  Download,
  UserCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export function TestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);

  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  const testLink = `${window.location.origin}/student/join/${id}`;

  useEffect(() => {
    teacherService
      .getTests()
      .then((tests) => {
        const found = tests.find((t) => t.id === id);
        setTest(found || null);
      })
      .catch(console.error);

    teacherService
      .getTestQuestions(id)
      .then(setQuestions)
      .catch((err) => toast.error("Could not load test questions"));

    teacherService
      .getTestResults(id)
      .then(setResults)
      .catch((err) => console.error("Could not load results", err));
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(testLink);
    toast.success("Test link copied!");
  };

  const toggleStudentExpansion = async (studentId) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
      return;
    }

    setExpandedStudentId(studentId);

    if (!studentDetails[studentId]) {
      setLoadingDetails(true);
      try {
        const details = await teacherService.getStudentTestDetails(
          id,
          studentId,
        );
        setStudentDetails((prev) => ({ ...prev, [studentId]: details }));
      } catch (err) {
        toast.error("Failed to load student question details");
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

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

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${test.name.replace(/\s+/g, "_")}_Results.csv`,
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
        setTimeLeft(`${formatDuration(diff)} left`);
      } else {
        setTimeLeft("Assessment Ended");
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

  if (!test)
    return (
      <div className="flex items-center justify-center p-20 animate-pulse">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-black animate-spin"></div>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Retrieving Test Data...</p>
        </div>
      </div>
    );

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="animate-fade-in pb-24">
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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">{test.name}</h1>
                <p className="text-gray-500 mt-1 text-[15px]">Detailed test oversight, distribution tools, and student performance metrics.</p>
             </div>
          </div>
          {timeLeft && (
            <div className="flex items-center gap-2 bg-[#2df07b] text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-[#2df07b]/10">
               <Clock size={16} strokeWidth={3} />
               {timeLeft}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Area: Config & Actions */}
          <div className="lg:col-span-1 space-y-10">
            
            {/* Distribution Card (QR Code) */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col items-center gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 text-gray-100 pointer-events-none">
                  <QrCode size={120} strokeWidth={0.5} />
               </div>
               
               <div className="text-center relative z-10 w-full">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 inline-block">Test Distribution</span>
                  <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-50 flex items-center justify-center mx-auto mb-6">
                    <QRCode value={testLink} size={160} />
                  </div>
                  <p className="text-[11px] font-bold text-gray-500 leading-relaxed max-w-[180px] mx-auto">
                    Students can join this assessment by scanning or following the link.
                  </p>
               </div>

               <div className="w-full space-y-3 relative z-10">
                  <button
                    onClick={copyLink}
                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md active:scale-95"
                  >
                    <Copy size={16} /> Copy Invite Link
                  </button>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-gray-400 text-[10px] font-mono truncate text-center">
                    {testLink}
                  </div>
               </div>
            </div>

            {/* Config Summary Card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 inline-block">Configuration</span>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[13px] font-bold text-gray-900">Duration</span>
                     <span className="text-[13px] font-bold text-[#2df07b] bg-zinc-900 px-2 py-0.5 rounded uppercase">{test.duration}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[13px] font-bold text-gray-900">Total Weight</span>
                     <span className="text-[13px] font-bold text-gray-500">{totalMarks} Pts</span>
                  </div>
                  <div className="pt-4 border-t border-gray-50 space-y-4">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Scheduled Launch</p>
                        <p className="text-[12px] font-bold text-gray-900">
                          {test.startTime ? new Date(test.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Immediate Launch'}
                        </p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Expiration</p>
                        <p className="text-[12px] font-bold text-gray-900">
                          {test.endTime ? new Date(test.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Never Expires'}
                        </p>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Status</span>
                     <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${test.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                        {test.status || 'Scheduled'}
                     </span>
                  </div>
               </div>
            </div>
          </div>

          {/* Main Body: Questions & Submissions */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* Question Assortment */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
               <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                  <Layers size={18} className="text-gray-400" />
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Curated Challenges</h2>
                  <span className="ml-auto text-[10px] font-black text-gray-400 uppercase tracking-widest">{questions.length} Items</span>
               </div>
               
               <div className="p-8">
                  {questions.length === 0 ? (
                    <div className="p-12 border border-gray-100 border-dashed rounded-2xl text-center text-gray-400 text-sm font-bold italic">
                      No questions assigned to this assessment.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questions.map((q, i) => (
                        <div key={q.id} className="bg-gray-50/30 border border-gray-100 hover:border-gray-200 p-4 rounded-xl flex items-center gap-4 transition-all group">
                           <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                             {i + 1}
                           </span>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-gray-900 truncate group-hover:text-black">{q.title}</p>
                             <div className="flex items-center gap-3 mt-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                               <span>{q.marks} Pts</span>
                               <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                               <span>{q.difficulty}</span>
                             </div>
                           </div>
                           <Link to={`/teacher/questions`} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-black">
                              <ChevronRight size={18} />
                           </Link>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            {/* Performance Ledger (Results) */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
               <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <UserCircle size={20} className="text-gray-400" />
                     <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Student Performance</h2>
                     <span className="bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest">
                        {results.length} Enrolled
                     </span>
                  </div>
                  <button
                    onClick={downloadResultsCSV}
                    disabled={results.length === 0}
                    className="flex items-center justify-center gap-2 py-2 px-5 text-[11px] font-black uppercase tracking-widest bg-white border border-gray-200 hover:border-gray-900 text-black rounded-lg transition-all disabled:opacity-30 disabled:grayscale shadow-sm active:scale-95"
                  >
                    <Download size={16} /> Export CSV
                  </button>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="border-b border-gray-50">
                        <tr>
                           <th className="px-8 py-5 w-12"></th>
                           <th className="px-4 py-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">Candidacy</th>
                           <th className="px-4 py-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">Result Weight</th>
                           <th className="px-4 py-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">Precision</th>
                           <th className="px-4 py-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">Outcome</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {results.length === 0 ? (
                          <tr>
                             <td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-bold text-sm italic">
                                No submissions found in the performance ledger.
                             </td>
                          </tr>
                        ) : (
                          results.map((r) => (
                            <React.Fragment key={r.studentId}>
                               <tr
                                 className={`hover:bg-gray-50/50 cursor-pointer transition-all ${expandedStudentId === r.studentId ? "bg-gray-50/80 shadow-inner" : ""}`}
                                 onClick={() => toggleStudentExpansion(r.studentId)}
                               >
                                  <td className="px-8 py-5 text-gray-300">
                                     {expandedStudentId === r.studentId ? (
                                       <ChevronDown size={18} className="text-black" />
                                     ) : (
                                       <ChevronRight size={18} />
                                     )}
                                  </td>
                                  <td className="px-4 py-5">
                                     <p className="text-sm font-black text-gray-900 truncate max-w-[200px] uppercase">{r.studentName}</p>
                                     <p className="text-[11px] font-medium text-gray-400 truncate max-w-[200px] mt-0.5">{r.studentEmail}</p>
                                  </td>
                                  <td className="px-4 py-5 font-mono text-[13px] font-bold text-gray-900">
                                     {r.totalScore?.toFixed(1)} <span className="text-gray-300 text-[11px]">/ {totalMarks}</span>
                                  </td>
                                  <td className="px-4 py-5">
                                     <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                           <div className={`h-full rounded-full ${r.overallAccuracy > 80 ? 'bg-[#2df07b]' : r.overallAccuracy > 50 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${r.overallAccuracy}%` }}></div>
                                        </div>
                                        <span className="font-mono text-[13px] font-bold text-gray-700">{Math.round(r.overallAccuracy)}%</span>
                                     </div>
                                  </td>
                                  <td className="px-4 py-5">
                                     <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border inline-flex items-center gap-1.5 ${r.status === "Passed" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                                        {r.status === "Passed" ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                                        {r.status}
                                     </span>
                                  </td>
                               </tr>

                               {/* Expanded Breakdown Hub */}
                               {expandedStudentId === r.studentId && (
                                 <tr>
                                    <td colSpan="5" className="p-0 bg-gray-50/30">
                                       <div className="px-8 py-10 pl-24 border-zinc-900/10 border-l-[4px]">
                                          <div className="flex items-center gap-2 mb-8">
                                             <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
                                             <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Question Breakdown Ledger</h4>
                                          </div>

                                          {loadingDetails && !studentDetails[r.studentId] ? (
                                            <div className="text-[12px] font-bold text-gray-400 flex items-center gap-3">
                                               <div className="w-4 h-4 rounded-full border-2 border-gray-100 border-t-black animate-spin"></div>
                                               Indexing Breakdown...
                                            </div>
                                          ) : !studentDetails[r.studentId] || studentDetails[r.studentId].length === 0 ? (
                                            <p className="text-xs font-bold text-gray-400 italic">No granular metrics retrieved.</p>
                                          ) : (
                                            <table className="w-full text-left border-collapse">
                                               <thead>
                                                  <tr className="border-b border-gray-100">
                                                     <th className="pb-4 font-black text-[9px] text-gray-400 uppercase tracking-widest">Problem Descriptor</th>
                                                     <th className="pb-4 font-black text-[9px] text-gray-400 uppercase tracking-widest">Yield</th>
                                                     <th className="pb-4 font-black text-[9px] text-gray-400 uppercase tracking-widest">Deviation</th>
                                                     <th className="pb-4 font-black text-[9px] text-gray-400 uppercase tracking-widest">Status</th>
                                                     <th className="pb-4 font-black text-[9px] text-gray-400 uppercase tracking-widest">Timestamp</th>
                                                  </tr>
                                               </thead>
                                               <tbody className="divide-y divide-gray-50/50">
                                                  {studentDetails[r.studentId].map((detail) => (
                                                    <tr key={detail.submissionId} className="group hover:bg-white/50 transition-colors">
                                                       <td className="py-4 text-[13px] font-bold text-gray-900">{detail.questionTitle}</td>
                                                       <td className="py-4 font-mono text-[13px] font-bold text-gray-900">{detail.score?.toFixed(1)}</td>
                                                       <td className="py-4 font-mono text-[13px] font-bold text-gray-400">{detail.accuracy}%</td>
                                                       <td className="py-4">
                                                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border inline-flex items-center gap-1 ${detail.status === "Passed" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                                                             {detail.status}
                                                          </span>
                                                       </td>
                                                       <td className="py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                          {new Date(detail.submissionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
}
