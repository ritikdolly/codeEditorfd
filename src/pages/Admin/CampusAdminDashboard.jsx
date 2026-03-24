import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Layers, ScrollText, TrendingUp, UserCheck, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { campusAdminService } from '../../services/api';
import { Link } from 'react-router-dom';
import { SetupCampus } from '../../components/campusAdmin/SetupCampus';



const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-600/60 transition-all"
  >
    <div className="flex items-center justify-between">
      <div className={`p-2.5 rounded-xl bg-slate-700/50 ${color}`}><Icon size={20} /></div>
      {to && <Link to={to} className="text-xs text-slate-400 hover:text-purple-400 transition-colors">View all →</Link>}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
    </div>
  </motion.div>
);

export const CampusAdminDashboard = () => {
  const { user } = useAuthStore();
  const campusId = user?.campusId;
  const [stats, setStats] = useState({ total: null, byRole: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campusId) { setLoading(false); return; }
    campusAdminService.listUsers(campusId, 0, 1)
      .then(data => setStats(s => ({ ...s, total: data.totalElements })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [campusId]);

  if (!campusId) {
    return <SetupCampus />;
  }

  const roleStats = [
    { label: 'Total Users', icon: Users, value: stats.total, color: 'text-purple-400', to: '/campus-admin/users' },
    { label: 'Departments', icon: Building2, value: null, color: 'text-blue-400', to: '/campus-admin/departments' },
    { label: 'Batches', icon: Layers, value: null, color: 'text-emerald-400', to: '/campus-admin/batches' },
    { label: 'Audit Logs', icon: ScrollText, value: null, color: 'text-amber-400', to: '/campus-admin/audit-logs' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Campus Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, <span className="text-purple-400 font-medium">{user?.name}</span>. Manage your campus from here.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roleStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Add User', icon: PlusCircle, to: '/campus-admin/users', desc: 'Create student, teacher or staff' },
            { label: 'Bulk Upload', icon: TrendingUp, to: '/campus-admin/bulk-upload', desc: 'Upload CSV/XLSX of users' },
            { label: 'Manage Departments', icon: UserCheck, to: '/campus-admin/departments', desc: 'Create and assign HODs' },
          ].map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <Link to={a.to} className="flex items-start gap-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all group">
                <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:bg-purple-600/30 transition-colors">
                  <a.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">{a.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
