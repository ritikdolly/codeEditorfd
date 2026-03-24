import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Search, Users } from 'lucide-react';
import { mentorService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const MentorDashboard = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    mentorService.getStudents()
      .then(setStudents)
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Mentor Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Your assigned students, <span className="text-purple-400 font-medium">{user?.name}</span></p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-5 w-fit">
        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400"><GraduationCap size={22} /></div>
        <div>
          <p className="text-3xl font-bold text-white">{loading ? '—' : filtered.length}</p>
          <p className="text-sm text-slate-400">Assigned Students</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 transition-colors" />
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading students...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-slate-400 py-16">
          <Users size={40} className="opacity-40" />
          <p className="text-sm">No students assigned to your sections yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.02 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-500/30 transition-all">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{u.name}</p>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/30 font-medium flex-shrink-0">STUDENT</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
