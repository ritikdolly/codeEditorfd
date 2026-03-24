import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, RefreshCw, Pencil } from 'lucide-react';
import { superAdminService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const PERMISSIONS = ['CAMPUS_MANAGEMENT', 'USER_MONITORING', 'SUPPORT', 'REPORTING_ANALYTICS'];
const PERM_COLOR = {
  CAMPUS_MANAGEMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  USER_MONITORING: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  SUPPORT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  REPORTING_ANALYTICS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const StaffManagement = () => {
  const { user } = useAuthStore();
  const [staff, setStaff] = useState([]);
  const [permsMap, setPermsMap] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [editPerms, setEditPerms] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const load = async () => {
    setLoading(true);
    try {
      const s = await superAdminService.listStaff();
      setStaff(s);
      // Load permissions for each staff member
      const perms = {};
      await Promise.all(s.map(async m => {
        perms[m.id] = await superAdminService.getStaffPermissions(m.id);
      }));
      setPermsMap(perms);
    } catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await superAdminService.createStaff(form);
      toast.success('Staff created!');
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSavePerms = async () => {
    try {
      await superAdminService.updateStaffPermissions(editPerms.id, { permissions: selectedPerms });
      toast.success('Permissions updated!');
      setEditPerms(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const togglePerm = (p) => setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldCheck size={22} className="text-rose-400" /> Staff Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage Super Admin staff and their scoped permissions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading...</div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-slate-400 py-16"><ShieldCheck size={40} className="opacity-40" /><p className="text-sm">No staff members yet.</p></div>
      ) : (
        <div className="space-y-3">
          {staff.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-600/60 transition-all">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold flex-shrink-0">
                {s.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{s.name}</p>
                <p className="text-xs text-slate-400">{s.email}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(permsMap[s.id] || []).length === 0
                    ? <span className="text-xs text-slate-600">No permissions</span>
                    : (permsMap[s.id] || []).map(p => (
                      <span key={p} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PERM_COLOR[p] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        {p.replace(/_/g, ' ')}
                      </span>
                    ))}
                </div>
              </div>
              <button onClick={() => { setEditPerms(s); setSelectedPerms([...(permsMap[s.id] || [])]); }}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors flex-shrink-0">
                <Pencil size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Staff Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-bold text-white mb-5">Add Staff Member</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          {[['Full Name', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel']].map(([label, key, type]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">{label}</label>
              <input type={type} required={key !== 'phone'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500" />
            </div>
          ))}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-amber-400">
            Default password = email address. User must reset on first login.
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700 transition-colors">Create Staff</button>
          </div>
        </form>
      </Modal>

      {/* Permissions Modal */}
      <Modal open={!!editPerms} onClose={() => setEditPerms(null)}>
        <h2 className="text-lg font-bold text-white mb-2">Edit Permissions</h2>
        <p className="text-slate-400 text-sm mb-5">Staff: <span className="text-white">{editPerms?.name}</span></p>
        <div className="space-y-3 mb-5">
          {PERMISSIONS.map(p => (
            <label key={p} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedPerms.includes(p) ? 'border-purple-500/60 bg-purple-500/10' : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'}`}>
              <input type="checkbox" checked={selectedPerms.includes(p)} onChange={() => togglePerm(p)} className="accent-purple-500" />
              <span className="text-sm text-white">{p.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditPerms(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
          <button onClick={handleSavePerms} className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors">Save Permissions</button>
        </div>
      </Modal>
    </div>
  );
};
