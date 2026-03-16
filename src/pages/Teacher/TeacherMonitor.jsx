import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const TeacherMonitor = () => {
  const { id: testId } = useParams();
  const [students, setStudents] = useState({}); // studentId -> status info

  useEffect(() => {
    // Note: User needs to install sockjs-client and @stomp/stompjs
    const socket = new SockJS('http://localhost:8080/ws-monitor');
    const client = Stomp.over(socket);

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
      case 'SUBMIT': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'START':
      case 'RECONNECT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DISCONNECT': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Test Monitor</h1>
          <p className="text-slate-400 mt-1">Real-time tracking for Test ID: {testId}</p>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
          Live Connection Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-slate-700/50 transition-all hover:border-purple-500/30 group">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Joined</p>
          <p className="text-4xl font-black text-white group-hover:scale-110 transition-transform origin-left">{studentList.length}</p>
        </div>
        <div className="glass-card p-6 border border-slate-700/50 transition-all hover:border-emerald-500/30 group">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Submitted</p>
          <p className="text-4xl font-black text-emerald-400 group-hover:scale-110 transition-transform origin-left">{submittedCount}</p>
        </div>
        <div className="glass-card p-6 border border-slate-700/50 transition-all hover:border-blue-500/30 group">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Active Now</p>
          <p className="text-4xl font-black text-blue-400 group-hover:scale-110 transition-transform origin-left">{activeCount}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-slate-700/50 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="text-left p-5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Student</th>
                <th className="text-left p-5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Live Status</th>
                <th className="text-left p-5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Progress</th>
                <th className="text-left p-5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {studentList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-600 italic">
                    Waiting for students to join...
                  </td>
                </tr>
              ) : (
                studentList.map(s => (
                  <tr key={s.studentId} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-5">
                      <p className="text-white font-bold group-hover:text-purple-400 transition-colors">{s.studentName}</p>
                      <p className="text-slate-500 text-xs font-mono">{s.studentId.substring(0,8)}...</p>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border tracking-tighter ${getStatusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full max-w-[100px] overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                            style={{ width: `${(s.questionsSolved / s.totalQuestions) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                          {s.questionsSolved} / {s.totalQuestions}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500 text-xs font-medium">
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
  );
};
