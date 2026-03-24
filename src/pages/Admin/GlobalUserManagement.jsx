import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Lock, Unlock, RefreshCw, KeyRound, ChevronLeft, ChevronRight } from 'lucide-react';
import { superAdminService, campusService } from '../../services/api';
import toast from 'react-hot-toast';

const ROLE_BADGE = {
  SUPER_ADMIN: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  CAMPUS_ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PLATFORM_STAFF: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  CAMPUS_STAFF: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  DEAN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  HOD: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  TEACHER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  STUDENT: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  MENTOR: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const ROLES = ['', 'SUPER_ADMIN', 'CAMPUS_ADMIN', 'PLATFORM_STAFF', 'CAMPUS_STAFF', 'DEAN', 'HOD', 'TEACHER', 'STUDENT', 'MENTOR'];

export const GlobalUserManagement = () => {
  const [users, setUsers] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [campuses, setCampuses] = useState([]);
  const [filters, setFilters] = useState({ role: '', campusId: '', isActive: '' });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    campusService.getAll().then(setCampuses).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page, size: 20 };
    if (filters.role) params.role = filters.role;
    if (filters.campusId) params.campusId = filters.campusId;
    if (filters.isActive !== '') params.isActive = filters.isActive === 'true';
    try { setUsers(await superAdminService.globalSearch(params)); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const action = async (fn, label, userId) => {
    try { await fn(userId); toast.success(label); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users size={22} className="text-purple-400" /> Global User Management</h1>
          <p className="text-slate-400 text-sm mt-1">{users.totalElements} users platform-wide</p>
        </div>
        <button onClick={load} className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw size={16} /></button>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-3">
        <select value={filters.role} onChange={e => { setFilters(f => ({ ...f, role: e.target.value })); setPage(0); }}
          className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <option value="">All Roles</option>
          {ROLES.slice(1).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filters.campusId} onChange={e => { setFilters(f => ({ ...f, campusId: e.target.value })); setPage(0); }}
          className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <option value="">All Campuses</option>
          {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.isActive} onChange={e => { setFilters(f => ({ ...f, isActive: e.target.value })); setPage(0); }}
          className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-slate-400 text-center py-16">Loading...</div>
        ) : users.content.length === 0 ? (
          <div className="text-slate-400 text-center py-16 flex flex-col items-center gap-3"><Users size={40} className="opacity-40" /><p className="text-sm">No users matched your filters.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 text-slate-400 text-left">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Campus</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.content.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ROLE_BADGE[u.role] || ROLE_BADGE.CAMPUS_STAFF}`}>{u.role.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{u.campusName || <span className="text-slate-600">Platform</span>}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium ${u.active ? 'text-emerald-400' : 'text-red-400'}`}>
                        {u.active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => action(superAdminService.forcePasswordReset, 'Reset queued', u.id)}
                          title="Force password reset"
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">
                          <KeyRound size={12} />
                        </button>
                        {u.active
                          ? <button onClick={() => action(superAdminService.lockAccount, `${u.name} locked`, u.id)} title="Lock"
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"><Lock size={12} /></button>
                          : <button onClick={() => action(superAdminService.unlockAccount, `${u.name} unlocked`, u.id)} title="Unlock"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"><Unlock size={12} /></button>
                        }
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {users.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"><ChevronLeft size={16} /></button>
          <span className="text-sm text-slate-400">Page {page + 1} of {users.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(users.totalPages - 1, p + 1))} disabled={page >= users.totalPages - 1}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
};
