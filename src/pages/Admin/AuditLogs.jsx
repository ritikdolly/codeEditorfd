import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Search, Clock, User } from 'lucide-react';
import { auditLogService } from '../../services/api';
import toast from 'react-hot-toast';

const ACTION_BADGE = {
  USER_CREATED: 'bg-emerald-500/20 text-emerald-400',
  USER_UPDATED: 'bg-blue-500/20 text-blue-400',
  USER_DEACTIVATED: 'bg-red-500/20 text-red-400',
  USER_ACTIVATED: 'bg-emerald-500/20 text-emerald-400',
  ROLE_ASSIGNED: 'bg-purple-500/20 text-purple-400',
};

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await auditLogService.getLogs(page, 30);
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.actorEmail?.toLowerCase().includes(search.toLowerCase()) ||
    l.targetId?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts) => ts ? new Date(ts).toLocaleString() : '—';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ScrollText size={22} className="text-amber-400" /> Audit Logs</h1>
          <p className="text-slate-400 text-sm mt-1">Track all administrative actions on this campus</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by action, actor email..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 transition-colors" />
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading logs...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-slate-400 py-16">
          <ScrollText size={40} className="opacity-40" />
          <p className="text-sm">No audit logs yet.</p>
        </div>
      ) : (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 text-slate-400 text-left">
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ACTION_BADGE[log.action] || 'bg-slate-700 text-slate-300'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                          {log.actorEmail?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-slate-300 truncate max-w-[160px]">{log.actorEmail}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs max-w-xs truncate">{log.details}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Clock size={11} />{formatTime(log.timestamp)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 text-sm transition-colors">← Prev</button>
          <span className="text-sm text-slate-400">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 text-sm transition-colors">Next →</button>
        </div>
      )}
    </div>
  );
};
