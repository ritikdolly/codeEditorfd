import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, UserCheck, Briefcase, Users, Search } from 'lucide-react';
import { deanService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'students', label: 'Students', icon: GraduationCap },
  { key: 'teachers', label: 'Teachers', icon: UserCheck },
  { key: 'hods', label: 'HODs & Mentors', icon: Briefcase },
];

const ROLE_BADGE = {
  STUDENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TEACHER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  HOD: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  MENTOR: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const UserCard = ({ user }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
    className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 hover:border-slate-600/60 transition-all">
    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-base flex-shrink-0">
      {user.name?.[0]?.toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-white truncate">{user.name}</p>
      <p className="text-xs text-slate-400 truncate">{user.email}</p>
    </div>
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${ROLE_BADGE[user.role] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>{user.role}</span>
  </motion.div>
);

export const DeanDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('students');
  const [data, setData] = useState({ students: [], teachers: [], hods: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([deanService.getStudents(), deanService.getTeachers(), deanService.getAcademicStaff('HOD')])
      .then(([students, teachers, hods]) => setData({ students, teachers, hods }))
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const current = data[activeTab] || [];
  const filtered = current.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = { students: data.students.length, teachers: data.teachers.length, hods: data.hods.length };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Dean's Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Campus-wide academic overview for <span className="text-purple-400 font-medium">{user?.name}</span></p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Students', value: counts.students, color: 'text-blue-400', icon: GraduationCap },
          { label: 'Teachers', value: counts.teachers, color: 'text-emerald-400', icon: UserCheck },
          { label: 'HODs', value: counts.hods, color: 'text-purple-400', icon: Briefcase },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-slate-700/50 ${s.color}`}><s.icon size={20} /></div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 gap-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setSearch(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === t.key ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/40'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 transition-colors" />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-slate-400 py-16">
          <Users size={40} className="opacity-40" /><p className="text-sm">No {activeTab} found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u, i) => <motion.div key={u.id} transition={{ delay: i * 0.04 }}><UserCard user={u} /></motion.div>)}
        </div>
      )}
    </div>
  );
};
