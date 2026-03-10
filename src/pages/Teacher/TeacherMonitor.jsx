export const TeacherMonitor = () => {
  const mockStudents = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Submitted', score: '8/10', time: '42m' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'Coding...', score: '-', time: '45m' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', status: 'Submitted', score: '10/10', time: '30m' },
  ];

  const statusColor = { 'Submitted': 'badge-green', 'Coding...': 'badge-blue', 'Disconnected': 'badge-red' };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Test Monitor</h1>
        <p className="text-slate-400 mt-1">Real-time student progress</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center"><p className="text-slate-400 text-sm">Total Joined</p><p className="text-3xl font-bold text-white mt-1">3</p></div>
        <div className="glass-card p-5 text-center"><p className="text-slate-400 text-sm">Submitted</p><p className="text-3xl font-bold text-green-400 mt-1">2</p></div>
        <div className="glass-card p-5 text-center"><p className="text-slate-400 text-sm">Active</p><p className="text-3xl font-bold text-blue-400 mt-1">1</p></div>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-400 font-medium">Student</th>
              <th className="text-left p-4 text-slate-400 font-medium">Status</th>
              <th className="text-left p-4 text-slate-400 font-medium">Time</th>
              <th className="text-left p-4 text-slate-400 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {mockStudents.map(s => (
              <tr key={s.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="p-4">
                  <p className="text-white font-medium">{s.name}</p>
                  <p className="text-slate-400 text-sm">{s.email}</p>
                </td>
                <td className="p-4"><span className={`badge ${statusColor[s.status] || 'badge-blue'}`}>{s.status}</span></td>
                <td className="p-4 text-slate-300">{s.time}</td>
                <td className="p-4 text-slate-300 font-mono">{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
