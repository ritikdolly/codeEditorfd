import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, Plus, RefreshCw, UserCog, Trash2, Search } from 'lucide-react';
import { departmentService, campusAdminService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={e => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm text-slate-400">{label}</label>
    <input {...props} className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors" />
  </div>
);

export const DepartmentManagement = () => {
  const { user } = useAuthStore();
  const campusId = user?.campusId;
  const [depts, setDepts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [hodModal, setHodModal] = useState(null); // dept object
  const [selectedHod, setSelectedHod] = useState('');
  const [form, setForm] = useState({ name: '', code: '', campusId });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = async () => {
    if (!campusId) return;
    setLoading(true);
    try {
      const [d, t] = await Promise.all([
        departmentService.getByCampus(campusId),
        campusAdminService.getUsersByRole('HOD', campusId),
      ]);
      setDepts(d);
      setTeachers(t);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [campusId]);

  const filtered = depts.filter(d => {
    const matchesSearch = !search || 
      d.name?.toLowerCase().includes(search.toLowerCase()) || 
      d.code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' ? d.active : !d.active);
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await departmentService.create({ ...form, campusId });
      toast.success('Department created!');
      setShowCreate(false);
      setForm({ name: '', code: '', campusId });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAssignHod = async () => {
    if (!selectedHod) return;
    try {
      await departmentService.assignHod(hodModal.id, selectedHod);
      toast.success('HOD assigned!');
      setHodModal(null);
      load();
    } catch { toast.error('Failed to assign HOD'); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this department?')) return;
    try {
      await departmentService.deactivate(id);
      toast.success('Department deactivated');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <School size={24} className="text-blue-400" />
            </div>
            Departments
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Structure and manage academic units across your campus.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={load} 
            className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-all duration-300 shadow-lg"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={18} /> New Department
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-8 relative group">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Search Departments</label>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Filter by name or department code..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-slate-600" 
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Status Filter</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer hover:border-slate-600"
          >
            <option value="ALL">All Departments</option>
            <option value="ACTIVE">Active Units</option>
            <option value="INACTIVE">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-sm font-medium animate-pulse">Fetching department list...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500 text-center">
            <div className="p-4 bg-slate-800/50 rounded-full">
              <School size={48} className="opacity-20" />
            </div>
            <div>
              <p className="text-white font-medium">No units identified</p>
              <p className="text-sm mt-1">Refine your search or create a new department.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/30 border-b border-slate-700/50 text-slate-400">
                  <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Department Details</th>
                  <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Registry Code</th>
                  <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Lead Authority (HOD)</th>
                  <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Management Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((d, i) => (
                  <motion.tr 
                    key={d.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    className="group hover:bg-slate-700/20 transition-all duration-200"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-100 group-hover:text-white transition-colors">{d.name}</td>
                    <td className="px-6 py-4"><span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs">{d.code}</span></td>
                    <td className="px-6 py-4">
                      {d.hodName ? (
                        <div className="flex items-center gap-2 text-purple-400">
                          <UserCog size={14} />
                          <span className="text-slate-200 font-medium">{d.hodName}</span>
                        </div>
                      ) : (
                        <span className="text-amber-500/80 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {d.active
                        ? <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Operational</span>
                        : <span className="inline-flex items-center gap-1.5 text-red-400 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20">Deactivated</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setHodModal(d)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-purple-400 hover:text-white hover:bg-purple-600 transition-all text-xs font-bold"
                        >
                          Revise HOD
                        </button>
                        {d.active && (
                          <button 
                            onClick={() => handleDeactivate(d.id)}
                            className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            title="Deactivate Unit"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Department Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-bold text-white mb-5">New Department</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Department Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Computer Science" />
          <Input label="Department Code" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CS-01" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">Create</button>
          </div>
        </form>
      </Modal>

      {/* Assign HOD Modal */}
      <Modal open={!!hodModal} onClose={() => setHodModal(null)}>
        <h2 className="text-lg font-bold text-white mb-2">Assign HOD</h2>
        <p className="text-slate-400 text-sm mb-5">Assigning to: <span className="text-white">{hodModal?.name}</span></p>
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-sm text-slate-400">Select HOD</label>
          <select value={selectedHod} onChange={e => setSelectedHod(e.target.value)}
            className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
            <option value="">-- Choose a user --</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setHodModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
          <button onClick={handleAssignHod} className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors">Assign HOD</button>
        </div>
      </Modal>
    </div>
  );
};
