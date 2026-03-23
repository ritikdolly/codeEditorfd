import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  BookOpen
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

  useEffect(() => {
    fetchTestData();
  }, [id]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const [testData, questionsData, resultsData] = await Promise.all([
        teacherService.getTestById(id),
        teacherService.getQuestionsByTestId(id),
        teacherService.getTestResults(id)
      ]);
      setTest(testData);
      setQuestions(questionsData);
      setResults(resultsData);
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
        const details = await teacherService.getStudentSubmissionDetails(id, studentId);
        setStudentDetails(prev => ({ ...prev, [studentId]: details }));
      } catch (error) {
        toast.error('Failed to load student details');
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const copyTestLink = () => {
    const link = `${window.location.origin}/join-test/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Protocol link copied to neural buffer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
           <div className="w-12 h-12 border-4 border-white/5 border-t-[#2df07b] rounded-full animate-spin shadow-[0_0_15px_rgba(45,240,123,0.3)]"></div>
           <p className="text-[#2df07b] font-bold text-[11px] uppercase tracking-[0.3em] animate-pulse">Initializing Data Stream...</p>
        </div>
      </div>
    );
  }

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
                Return to Command Center
             </button>
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#2df07b]/10 border border-[#2df07b]/20 flex items-center justify-center text-[#2df07b] shadow-[0_0_20px_rgba(45,240,123,0.1)]">
                   <Target size={28} />
                </div>
                <div>
                   <h1 className="text-4xl font-bold text-white tracking-tight uppercase">{test?.title}</h1>
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
              Share Protocol
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[
             { label: 'Submissions', value: results.length, icon: Users, color: 'text-white' },
             { label: 'Avg precision', value: `${Math.round(averageAccuracy)}%`, icon: Target, color: 'text-[#2df07b]' },
             { label: 'Max Capacity', value: totalPossibleMarks, icon: Trophy, color: 'text-amber-400' },
             { label: 'Status Code', value: 'OPTIMAL', icon: CheckCircle2, color: 'text-[#2df07b]' }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Results Table */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <BarChart3 size={20} className="text-[#2df07b]" />
                  <h2 className="text-[14px] font-bold text-white uppercase tracking-widest">Candidate Ledger</h2>
               </div>
               <div className="relative group">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2df07b] transition-colors" />
                  <input 
                     type="text" 
                     placeholder="ID SCAN..."
                     className="bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-[11px] font-bold uppercase text-white focus:outline-none focus:border-[#2df07b]/50 transition-all w-48"
                  />
               </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-black/20 border-b border-white/5">
                        <tr>
                           <th className="px-10 py-6 w-12"></th>
                           <th className="px-6 py-6 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Candidate Identity</th>
                           <th className="px-6 py-6 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Auth State</th>
                           <th className="px-6 py-6 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Precision Yield</th>
                           <th className="px-6 py-6 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-center">Outcome</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.02]">
                        {results.length === 0 ? (
                          <tr><td colSpan="5" className="px-10 py-24 text-center text-gray-700 font-bold text-[11px] uppercase tracking-[0.4em] opacity-40 animate-pulse">Scanning Current Vector... No signals identified.</td></tr>
                        ) : (
                          results.map((r) => (
                            <React.Fragment key={r.studentId}>
                               <tr className={`hover:bg-white/[0.01] cursor-pointer transition-all ${expandedStudentId === r.studentId ? "bg-white/[0.02]" : ""}`} onClick={() => toggleStudentExpansion(r.studentId)}>
                                  <td className="px-10 py-8 text-gray-700">
                                     {expandedStudentId === r.studentId ? <ChevronDown size={22} className="text-[#2df07b]" /> : <ChevronRight size={22} className="group-hover:text-white" />}
                                  </td>
                                  <td className="px-6 py-8">
                                     <p className="text-[17px] font-bold text-white uppercase tracking-tight">{r.studentName}</p>
                                     <p className="text-[11px] font-medium text-gray-600 mt-1 font-mono">{r.studentEmail}</p>
                                  </td>
                                  <td className="px-6 py-8">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${r.submissionStatus === 'SUBMITTED' ? 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                      {r.submissionStatus === 'SUBMITTED' ? 'SECURED' : 'ACTIVE'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-8">
                                     <div className="flex items-center gap-3">
                                        <p className="text-[18px] font-bold text-white font-mono tracking-tighter">
                                           {r.totalScore?.toFixed(1)}
                                        </p>
                                        <span className="text-gray-700 text-[10px] font-bold">/ {totalPossibleMarks} PTS</span>
                                     </div>
                                     <div className="flex items-center gap-2 mt-1.5">
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[80px]">
                                           <div className="h-full bg-[#2df07b] shadow-[0_0_10px_#2df07b]" style={{ width: `${r.overallAccuracy}%` }}></div>
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{Math.round(r.overallAccuracy)}% PRECISION</p>
                                     </div>
                                  </td>
                                  <td className="px-6 py-8 text-center">
                                     <div className={`px-4 py-2 rounded-2xl border inline-flex items-center gap-2.5 transition-all ${r.status === "Passed" || r.status === "Pass" ? "bg-[#2df07b] text-black border-[#2df07b] shadow-[0_0_20px_rgba(45,240,123,0.2)]" : "bg-rose-500/10 text-rose-500 border-rose-500/30"}`}>
                                        {r.status === "Passed" || r.status === "Pass" ? <CheckCircle2 size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
                                        <span className="text-[11px] font-bold uppercase tracking-widest">{r.status?.toUpperCase()}</span>
                                     </div>
                                  </td>
                                </tr>
                                {expandedStudentId === r.studentId && (
                                  <tr className="bg-white/[0.01]">
                                     <td colSpan="5" className="p-0">
                                        <div className="px-16 py-12 bg-black/40 border-l-[6px] border-[#2df07b] shadow-inner">
                                           <div className="flex items-center gap-4 mb-10">
                                              <div className="w-8 h-8 rounded-xl bg-[#2df07b]/10 text-[#2df07b] flex items-center justify-center font-bold">
                                                 <BarChart3 size={16} />
                                              </div>
                                              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em]">Individual Performance Vectors</h4>
                                           </div>
                                           {loadingDetails && !studentDetails[r.studentId] ? (
                                             <div className="flex items-center gap-6 py-10 justify-center">
                                                <div className="w-6 h-6 border-2 border-white/5 border-t-[#2df07b] rounded-full animate-spin"></div>
                                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest animate-pulse">Deciphering Submission Data...</span>
                                             </div>
                                           ) : !studentDetails[r.studentId] || studentDetails[r.studentId].length === 0 ? (
                                             <div className="p-10 text-center bg-white/5 rounded-[32px] border border-white/5">
                                                <p className="text-[11px] font-bold text-gray-700 uppercase tracking-[.4em]">Zero Output Identified on this Vector.</p>
                                             </div>
                                           ) : (
                                             <div className="grid gap-6">
                                               {studentDetails[r.studentId].map((detail) => (
                                                 <div key={detail.submissionId} className="bg-[#111111] border border-white/10 rounded-[32px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl transition-all hover:bg-black/60 hover:border-[#2df07b]/30 group/detail">
                                                    <div className="flex flex-col gap-2 flex-1">
                                                       <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Challenge Descriptor</p>
                                                       <p className="text-[16px] font-bold text-white uppercase tracking-tight group-hover/detail:text-[#2df07b] transition-colors">{detail.questionTitle}</p>
                                                    </div>
                                                    <div className="flex gap-16">
                                                       <div className="flex flex-col gap-2">
                                                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Yield</p>
                                                          <p className="text-[16px] font-bold text-white font-mono">{detail.score?.toFixed(1)} <span className="opacity-30 text-[11px]">PTS</span></p>
                                                       </div>
                                                       <div className="flex flex-col gap-2">
                                                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Accuracy</p>
                                                          <p className="text-[16px] font-bold text-[#2df07b] font-mono">{detail.accuracy}%</p>
                                                       </div>
                                                       <div className="flex flex-col gap-2 min-w-[100px]">
                                                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Evaluation</p>
                                                          <div className={`text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 mt-1 ${detail.status === "Passed" || detail.status === "Pass" ? "text-[#2df07b]" : "text-rose-500"}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${detail.status === "Passed" || detail.status === "Pass" ? "bg-[#2df07b] shadow-[0_0_8px_#2df07b]" : "bg-rose-500 shadow-[0_0_8px_#ef4444]"}`}></div>
                                                            {detail.status?.toUpperCase()}
                                                          </div>
                                                       </div>
                                                    </div>
                                                    <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 text-right">
                                                       <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[.2em] mb-1">Stream Log</p>
                                                       <p className="text-[13px] font-bold text-gray-500 font-mono italic">{new Date(detail.submissionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
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

          {/* Sidebar - Test Info & Access */}
          <div className="space-y-10">
            {/* Access Protocol */}
            <div className="bg-[#111111] border border-white/5 rounded-[40px] p-10 shadow-2xl space-y-8">
               <div className="flex items-center gap-3">
                  <ExternalLink size={18} className="text-[#2df07b]" />
                  <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Access Protocol</h3>
               </div>
               <div className="p-8 bg-black rounded-3xl border border-white/5 flex flex-col items-center">
                  <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                     <QRCode 
                        value={`${window.location.origin}/join-test/${id}`}
                        size={160}
                        fgColor="#000000"
                        level="H"
                     />
                  </div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-8 text-center leading-relaxed">Scan with external device to initiate mobile bridge</p>
               </div>
               <button 
                  onClick={copyTestLink}
                  className="w-full py-4 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-[#2df07b] hover:bg-[#2df07b]/5 hover:border-[#2df07b]/30 transition-all flex items-center justify-center gap-2 group"
               >
                  <Copy size={14} className="group-hover:scale-110 transition-transform" />
                  Clone Entry Point
               </button>
            </div>

            {/* Questions List */}
            <div className="bg-[#111111] border border-white/5 rounded-[40px] p-10 shadow-2xl">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <BookOpen size={18} className="text-[#2df07b]" />
                     <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Assigned Challenges</h3>
                  </div>
                  <span className="bg-[#2df07b]/10 text-[#2df07b] text-[10px] font-bold px-3 py-1 rounded-full">{questions.length} Units</span>
               </div>
               <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={q.questionId} className="group cursor-pointer p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-[#2df07b]/30 transition-all">
                       <div className="flex items-start gap-4">
                          <span className="text-[10px] font-mono text-gray-700 font-bold mt-1">0{i+1}</span>
                          <div className="flex-1">
                             <p className="text-[14px] font-bold text-white uppercase tracking-tight group-hover:text-[#2df07b] transition-colors">{q.title}</p>
                             <div className="flex items-center gap-4 mt-2">
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{q.marks} Marks</span>
                                <span className={`w-1 h-1 rounded-full bg-gray-800`}></span>
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
    </div>
  );
};
