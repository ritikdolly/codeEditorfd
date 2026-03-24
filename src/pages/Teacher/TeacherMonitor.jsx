import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { ShieldCheck, Users, CheckCircle2, Zap, ArrowLeft, Monitor, Clock } from 'lucide-react';
import { teacherService } from '../../services/api';
import toast from 'react-hot-toast';

export const TeacherMonitor = () => {
  const { id: testId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState({}); // studentId -> status info
  const [test, setTest] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    teacherService.getTest(testId)
      .then(setTest)
      .catch(() => toast.error("Failed to load test metadata"));

    const socket = new SockJS('http://localhost:8080/ws-monitor');
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
      if (client && client.connected) client.disconnect();
    };
  }, [testId]);

  useEffect(() => {
    if (!test || !test.endTime) return;

    const calculateTime = () => {
      const now = new Date();
      const end = new Date(test.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Test Ended');
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [test]);

  const studentList = Object.values(students);
  const submittedCount = studentList.filter(s => s.status === 'SUBMIT').length;
  const activeCount = studentList.length - submittedCount;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'SUBMIT': return 'bg-accent/10 text-accent border-accent/20';
      case 'START':
      case 'RECONNECT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DISCONNECT': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-white/5 text-gray-500 border-white/10';
    }
  };

  return (
    <div className="pb-20 relative z-10 animate-fade-in p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="flex items-center gap-6">
             <button 
                onClick={() => navigate(`/teacher/tests/${testId}`)}
                className="p-3 border border-white/10 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-xl group"
             >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
             </button>
             <div>
                <div className="flex items-center gap-2 mb-2 text-accent">
                   <Monitor size={14} />
                   <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Real-time Monitoring</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase">Live <span className="text-accent">Monitor</span></h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-60 italic">{test?.name || 'Loading Test...'}</p>
                  {timeLeft && (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${timeLeft.includes('Ended') ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                      <Clock size={12} className={timeLeft.includes('Ended') ? 'text-rose-500' : 'text-accent animate-pulse'} />
                      {timeLeft}
                    </div>
                  )}
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3 bg-black border border-accent/20 text-accent px-5 py-2.5 rounded-full shadow-lg shadow-accent/5">
             <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">Stream Active</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users size={100} className="text-blue-400" />
             </div>
             <div className="flex items-center justify-between">
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Active Students</span>
               <Users size={18} className="text-blue-400" />
             </div>
             <p className="text-5xl font-black text-white">{studentList.length}</p>
          </div>
          <div className="glass-card p-8 border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CheckCircle2 size={100} className="text-accent" />
             </div>
             <div className="flex items-center justify-between">
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Submissions</span>
               <CheckCircle2 size={18} className="text-accent" />
             </div>
             <p className="text-5xl font-black text-accent">{submittedCount}</p>
          </div>
          <div className="glass-card p-8 border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap size={100} className="text-amber-400" />
             </div>
             <div className="flex items-center justify-between">
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Ongoing</span>
               <Zap size={18} className="text-amber-400" />
             </div>
             <p className="text-5xl font-black text-amber-400">{activeCount}</p>
          </div>
        </div>

        {/* Monitor Table */}
        <div className="glass-card overflow-hidden border border-white/5">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 uppercase select-none">
                  <th className="px-6 py-5 text-slate-500 text-[10px] font-black tracking-widest">Student</th>
                  <th className="px-6 py-5 text-slate-500 text-[10px] font-black tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-slate-500 text-[10px] font-black tracking-widest">Progress / Accuracy</th>
                  <th className="px-6 py-5 text-slate-500 text-[10px] font-black tracking-widest text-right">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {studentList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-24 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-40">
                          <Users size={40} className="text-slate-700" strokeWidth={1} />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-600 italic">Waiting for students to connect...</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  studentList.map(s => (
                    <tr key={s.studentId} className="hover:bg-white/[0.01] transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-slate-600 group-hover:text-accent transition-colors">
                              {s.studentName?.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-black text-white uppercase tracking-tight">{s.studentName}</p>
                              <p className="text-[10px] font-medium text-slate-600 italic">ID: {s.studentId.substring(0,8)}...</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest ${getStatusBadge(s.status)}`}>
                             {s.status}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                             <span className="text-slate-600">Question {s.questionsSolved} of {s.totalQuestions}</span>
                             <span className="text-white">{Math.round((s.questionsSolved / s.totalQuestions) * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full transition-all duration-700 ${s.status === 'SUBMIT' ? 'bg-accent' : 'bg-gradient-to-r from-accent/40 to-accent'}`}
                              style={{ width: `${(s.questionsSolved / s.totalQuestions) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-[11px] font-bold text-slate-600">
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
