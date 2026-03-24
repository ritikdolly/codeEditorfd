import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, RefreshCw, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ShieldCheck, User, Mail,
  Upload, FileText, AlertCircle, Info
} from 'lucide-react';
import { campusAdminService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ROLES = ['STUDENT', 'TEACHER', 'HOD', 'MENTOR', 'DEAN', 'CAMPUS_STAFF'];

const ROLE_BADGE = {
  STUDENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TEACHER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  HOD: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  MENTOR: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DEAN: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  CAMPUS_STAFF: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
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

export const UserManagement = () => {
  const { user } = useAuthStore();
  const campusId = user?.campusId;
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'STUDENT', campusId });

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const load = useCallback(async () => {
    if (!campusId) return;
    setLoading(true);
    try {
      const data = await campusAdminService.listUsers(campusId, page, 20);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [campusId, page]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const matchesSearch = !search || 
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' ? u.active : !u.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await campusAdminService.createUser({ ...form, campusId });
      toast.success('User created! Welcome email sent.');
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '', role: 'STUDENT', campusId });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleActive = async (u) => {
    try {
      if (u.active) {
        await campusAdminService.deactivateUser(u.id);
        toast.success(`${u.name} deactivated`);
      } else {
        await campusAdminService.activateUser(u.id);
        toast.success(`${u.name} activated`);
      }
      load();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Users size={24} className="text-purple-400" />
            </div>
            User Management
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Create, authorize and oversee your campus user accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={load} 
            className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-purple-400 hover:border-purple-500/40 transition-all duration-300 shadow-lg shadow-black/20"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 border border-purple-400/20 active:scale-95"
          >
            <Plus size={18} /> Add New User
          </button>
          <button 
            onClick={() => setShowBulk(true)} 
            className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95"
          >
            <Upload size={18} /> Bulk Upload
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-5 relative group">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Search Directory</label>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name, email or UID..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 placeholder:text-slate-600" 
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Filter by Role</label>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer hover:border-slate-600"
          >
            <option value="ALL">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Account Status</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer hover:border-slate-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <div className="lg:col-span-1">
          <button 
            onClick={() => { setRoleFilter('ALL'); setStatusFilter('ALL'); setSearch(''); }}
            className="w-full py-3 text-slate-500 hover:text-white text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative group/table">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-transparent rounded-2xl blur opacity-0 group-hover/table:opacity-100 transition duration-500"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
              <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium animate-pulse">Syncing user directory...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
              <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700/50">
                <Users size={48} className="opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">No results found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/30 border-b border-slate-700/50 text-slate-400">
                    <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">User Profile</th>
                    <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Email Address</th>
                    <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Access Role</th>
                    <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Account Integrity</th>
                    <th className="px-6 py-4 font-semibold tracking-wide uppercase text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filtered.map((u, i) => (
                    <motion.tr 
                      key={u.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.02 }}
                      className="group/row hover:bg-slate-700/20 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-500/10 group-hover/row:scale-110 transition-transform">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100 group-hover/row:text-white">{u.name}</p>
                            {u.mustChangePassword && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-tighter mt-0.5">
                                <RefreshCw size={10} className="animate-spin-slow" /> Reset Required
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 group-hover/row:text-slate-300 font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold tracking-wide uppercase ${ROLE_BADGE[u.role] || ROLE_BADGE.CAMPUS_STAFF}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right sm:text-left">
                        {u.active
                          ? <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20"><CheckCircle size={14} /> Active</span>
                          : <span className="inline-flex items-center gap-2 text-slate-500 text-xs font-semibold px-2 py-1 bg-slate-500/10 rounded-lg border border-slate-500/20"><XCircle size={14} /> Suspended</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleActive(u)}
                          className={`text-xs px-4 py-2 rounded-xl border font-bold tracking-tight transition-all duration-300 ${u.active ? 'border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                        >
                          {u.active ? 'Terminate' : 'Restore'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"><ChevronLeft size={16} /></button>
          <span className="text-sm text-slate-400">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"><ChevronRight size={16} /></button>
        </div>
      )}

      {/* Create User Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><ShieldCheck size={18} className="text-purple-400" /> Create New User</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Full Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe" />
          <Input label="Email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
          <Input label="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-amber-400">
            <Mail size={12} className="inline mr-1.5" /> Default password = email. User will be prompted to reset on first login.
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors">Create User</button>
          </div>
        </form>
      </Modal>
 
      {/* Bulk Upload Modal */}
      <Modal open={showBulk} onClose={() => { setShowBulk(false); setBulkPreview(null); setBulkFile(null); }}>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Upload size={18} className="text-purple-400" /> Bulk Import Users
        </h2>
        
        {!bulkPreview ? (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Info size={14} /> Format Instructions
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload a <code className="text-purple-400">.xlsx</code> or <code className="text-purple-400">.csv</code> file with the following columns:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">1. Name</div>
                <div className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">2. Email (Unique)</div>
                <div className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">3. Phone (Optional)</div>
                <div className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">4. Role</div>
                <div className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800 font-bold">5. Department Name</div>
                <div className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800 font-bold">6. Batch Name</div>
                <div className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800 font-bold">7. Session (Year)</div>
              </div>
              <p className="text-[10px] text-amber-500/80 italic">
                * Department & Batch will be automatically created if they don't exist.
              </p>
            </div>
 
            <label className="flex flex-col items-center justify-center py-10 bg-slate-800/30 border-2 border-dashed border-slate-700/50 rounded-2xl hover:bg-slate-800/50 hover:border-purple-500/50 transition-all cursor-pointer group">
              <Upload size={32} className="text-slate-600 group-hover:text-purple-500 transition-colors mb-2" />
              <span className="text-sm text-slate-400 group-hover:text-slate-200">Click to browse or drag file</span>
              <input 
                type="file" 
                hidden 
                accept=".csv,.xlsx,.xls" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setBulkFile(file);
                  try {
                    const preview = await campusAdminService.previewUpload(file);
                    setBulkPreview(preview);
                  } catch (err) {
                    toast.error("Failed to parse file. Please check format.");
                    setBulkFile(null);
                  }
                }} 
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-emerald-400">{bulkPreview.validCount}</p>
                <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-tighter">Valid Rows</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-400">{bulkPreview.invalidCount}</p>
                <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-tighter">Errors</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-400">{bulkPreview.totalRows}</p>
                <p className="text-[10px] text-blue-500/70 font-bold uppercase tracking-tighter">Total</p>
              </div>
            </div>
 
            {bulkPreview.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><AlertCircle size={12} /> Parsing Issues</p>
                {bulkPreview.errors.map((err, i) => (
                  <p key={i} className="text-[10px] text-amber-500/80">• {err}</p>
                ))}
              </div>
            )}
 
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => { setBulkPreview(null); setBulkFile(null); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition-colors"
                disabled={bulkProcessing}
              >
                Reset
              </button>
              <button 
                onClick={async () => {
                  setBulkProcessing(true);
                  try {
                    const result = await campusAdminService.processUpload(bulkFile, campusId);
                    toast.success(`Import complete! Successful: ${result.successCount}`);
                    if (result.failCount > 0) {
                      toast.error(`${result.failCount} rows skipped. Check logs.`);
                    }
                    setShowBulk(false);
                    setBulkPreview(null);
                    setBulkFile(null);
                    load();
                  } catch (err) {
                    toast.error("Import failed unexpectedly.");
                  } finally {
                    setBulkProcessing(false);
                  }
                }}
                className={`flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2 ${bulkProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={bulkProcessing || bulkPreview.validCount === 0}
              >
                {bulkProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />} 
                {bulkProcessing ? "Processing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
