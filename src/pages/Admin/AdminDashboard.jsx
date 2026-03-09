import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Users, BookOpen, ClipboardList, Activity } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getDashboard().then(setStats).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents ?? '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Teachers', value: stats?.totalTeachers ?? '—', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Tests', value: stats?.totalTests ?? '—', icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Submissions', value: stats?.totalSubmissions ?? '—', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon size={22} className={card.color} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
