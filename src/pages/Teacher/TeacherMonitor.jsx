import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { ShieldCheck, Users, CheckCircle2, Zap, ArrowLeft, Monitor } from 'lucide-react';

export const TeacherMonitor = () => {
  const { id: testId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState({}); // studentId -> status info

  useEffect(() => {
    // Note: User needs to install sockjs-client and @stomp/stompjs
    const socket = new SockJS('http://localhost:8081/ws-monitor');
    const client = Stomp.over(socket);
    client.debug = null;

    client.connect({}, () => {
      client.subscribe(`/topic/test/${testId}/monitor`, (message) => {
        const update = JSON.parse(message.body);
        setStudents(prev => ({
          ...prev,
          [update.studentId]: {
            ...update,
            lastUpdate: new Date().toLocaleTimeString()
          }
        }));
      });
    });

    return () => {
      if (client.connected) client.disconnect();
    };
  }, [testId]);

  const studentList = Object.values(students);
  const submittedCount = studentList.filter(s => s.status === 'SUBMIT').length;
  const activeCount = studentList.length - submittedCount;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'SUBMIT': return 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20';
      case 'START':
      case 'RECONNECT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DISCONNECT': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-white/5 text-gray-500 border-white/10';
    }
  };

  return (
    <div className="pb-20 relative z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="flex items-center gap-6">
             <button 
                onClick={() => navigate('/teacher')}
                className="p-3 border border-white/10 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-xl group"
             >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
             </button>
             <div>
                <div className="flex items-center gap-2 mb-2 text-[#2df07b]">
                   <Monitor size={14} />
                   <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Real-time Monitoring</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight uppercase">Live Test Monitor</h1>
                <p className="text-gray-500 mt-2 text-[15px] font-medium max-w-xl">Monitoring student progress for test: <span className="text-white font-mono">{testId?.substring(0,8)}...</span></p>
             </div>
          </div>
          <div className="flex items-center gap-3 bg-black border border-[#2df07b]/20 text-[#2df07b] px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(45,240,123,0.05)]">
             <div className="w-2 h-2 rounded-full bg-[#2df07b] animate-pulse"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Stream Active</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#111111] p-8 border border-white/5 rounded-[32px] transition-all hover:border-[#2df07b]/20 group shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Active Students</p>
               <Users size={18} className="text-gray-600 group-hover:text-white transition-colors" />
             </div>
             <p className="text-5xl font-bold text-white group-hover:scale-105 transition-transform origin-left font-outfit">{studentList.length}</p>
          </div>
          <div className="bg-[#111111] p-8 border border-white/5 rounded-[32px] transition-all hover:border-[#2df07b]/20 group shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Submissions Completed</p>
               <CheckCircle2 size={18} className="text-[#2df07b] group-hover:scale-110 transition-transform" />
             </div>
             <p className="text-5xl font-bold text-[#2df07b] group-hover:scale-105 transition-transform origin-left font-outfit">{submittedCount}</p>
          </div>
          <div className="bg-[#111111] p-8 border border-white/5 rounded-[32px] transition-all hover:border-[#2df07b]/20 group shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Student Activity</p>
               <Zap size={18} className="text-blue-400 group-hover:animate-pulse" />
             </div>
             <p className="text-5xl font-bold text-blue-400 group-hover:scale-105 transition-transform origin-left font-outfit">{activeCount}</p>
          </div>
        </div>

        {/* Monitor Table */}
        <div className="bg-[#111111] overflow-hidden border border-white/5 rounded-[40px] shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="text-left p-6 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Student</th>
                  <th className="text-left p-6 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Status</th>
                  <th className="text-left p-6 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Accuracy / Score</th>
                  <th className="text-left p-6 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {studentList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-24 text-center text-gray-700 italic font-medium">
                      Waiting for students to connect...
                    </td>
                  </tr>
                ) : (
                  studentList.map(s => (
                    <tr key={s.studentId} className="hover:bg-white/[0.01] transition-all group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-gray-500 border border-white/5 group-hover:text-[#2df07b] transition-colors">
                              {s.studentName?.charAt(0)}
                           </div>
                           <div>
                              <p className="text-white font-bold group-hover:text-white transition-colors">{s.studentName}</p>
                              <p className="text-gray-600 text-[10px] font-mono mt-0.5 uppercase tracking-tighter">ID: {s.studentId.substring(0,12)}...</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-widest ${getStatusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-0.5">
                             <span className="text-gray-600 font-mono">Test Progress</span>
                             <span className="text-white font-mono">{s.questionsSolved} <span className="opacity-30">/</span> {s.totalQuestions}</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden shadow-inner">
                            <div 
                              className={`h-full transition-all duration-700 shadow-[0_0_10px_rgba(45,240,123,0.1)] ${s.status === 'SUBMIT' ? 'bg-[#2df07b]' : 'bg-gradient-to-r from-[#2df07b]/40 to-[#2df07b]'}`}
                              style={{ width: `${(s.questionsSolved / s.totalQuestions) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-gray-600 text-[11px] font-mono font-medium">
                        {s.lastUpdate}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

