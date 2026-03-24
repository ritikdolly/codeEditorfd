import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Building2, Users, TrendingUp, ShieldCheck, Layers, BarChart3, PlusCircle } from 'lucide-react';
import { superAdminService, campusService } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  INACTIVE: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  SUSPENDED: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  ARCHIVED: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-5 hover:border-slate-600/60 transition-all">
    <div className={`p-3 rounded-xl bg-slate-700/50 ${color}`}><Icon size={22} /></div>
    <div className="flex-1">
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
    {to && <Link to={to} className="text-xs text-slate-500 hover:text-purple-400 transition-colors">View →</Link>}
  </motion.div>
);

export const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([superAdminService.getPlatformStats(), campusService.getAll()])
      .then(([s, c]) => { setStats(s); setCampuses(c.slice(0, 5)); })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Campuses', value: stats?.totalCampuses, icon: Building2, color: 'text-blue-400', to: '/admin/campuses' },
    { label: 'Active Campuses', value: stats?.activeCampuses, icon: Globe, color: 'text-emerald-400' },
    { label: 'Suspended', value: stats?.suspendedCampuses, icon: ShieldCheck, color: 'text-amber-400' },
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-purple-400', to: '/admin/users' },
    { label: 'Active Users', value: stats?.activeUsers, icon: TrendingUp, color: 'text-teal-400' },
    { label: 'Platform Staff', value: stats?.totalSuperAdminStaff, icon: ShieldCheck, color: 'text-rose-400', to: '/admin/staff' },
    { label: 'Active Plans', value: stats?.activePlans, icon: Layers, color: 'text-indigo-400', to: '/admin/subscriptions' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 size={24} className="text-purple-400" /> Super Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide governance and oversight</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {statCards.slice(4).map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 + i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New Campus', to: '/admin/campuses', icon: Building2 },
            { label: 'Manage Users', to: '/admin/users', icon: Users },
            { label: 'Manage Staff', to: '/admin/staff', icon: ShieldCheck },
            { label: 'Subscriptions', to: '/admin/subscriptions', icon: Layers },
          ].map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
              <Link to={a.to} className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all group text-sm font-medium text-slate-300 hover:text-white">
                <a.icon size={18} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                {a.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Campuses */}
      {campuses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Campuses</h2>
            <Link to="/admin/campuses" className="text-xs text-purple-400 hover:text-purple-300">View all →</Link>
          </div>
          <div className="space-y-2">
            {loading ? <div className="text-slate-400 text-sm py-4 text-center">Loading...</div> : campuses.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl px-5 py-3.5 hover:border-slate-600/60 transition-all">
                <div>
                  <p className="text-white font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{c.code}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLOR[c.status] || STATUS_COLOR.ACTIVE}`}>
                  {c.status || 'ACTIVE'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
