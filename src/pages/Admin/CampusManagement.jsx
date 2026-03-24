import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Search, RefreshCw, Settings, UserCheck, Globe, UserPlus } from 'lucide-react';
import { campusService, superAdminService } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  INACTIVE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  SUSPENDED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ARCHIVED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'];

const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          onClick={e => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const CampusManagement = () => {
  const [campuses, setCampuses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [configModal, setConfigModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [createForm, setCreateForm] = useState({ name: '', code: '', address: '' });
  const [configForm, setConfigForm] = useState({});
  const [statusForm, setStatusForm] = useState({ status: 'ACTIVE', reason: '' });
  const [adminModal, setAdminModal] = useState(null);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '' });

  const load = async () => {
    setLoading(true);
    try { setCampuses(await campusService.getAll()); }
    catch { toast.error('Failed to load campuses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = campuses.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await campusService.create(createForm);
      toast.success('Campus created!');
      setShowCreate(false);
      setCreateForm({ name: '', code: '', address: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async () => {
    try {
      await superAdminService.changeCampusStatus(statusModal.id, statusForm);
      toast.success('Status updated!');
      setStatusModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleConfigSave = async () => {
    try {
      await superAdminService.updateCampusConfig(configModal.id, configForm);
      toast.success('Config updated!');
      setConfigModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await superAdminService.createCampusAdmin(adminModal.id, adminForm);
      toast.success('Campus Admin created successfully!');
      setAdminModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create admin'); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Building2 size={22} className="text-blue-400" /> Campus Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all campuses across the platform</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> New Campus
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or code..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading campuses...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4 hover:border-slate-600/60 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{c.code}</p>
                  {c.domain && <p className="text-xs text-blue-400 flex items-center gap-1 mt-1"><Globe size={11} />{c.domain}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLOR[c.status] || STATUS_COLOR.ACTIVE}`}>
                  {c.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{c.address || 'No address'}</p>
              <div className="flex gap-2 pt-1 border-t border-slate-700/40">
                <button onClick={() => { setAdminModal(c); setAdminForm({ name: '', email: '', phone: '' }); }}
                  className="flex-1 text-xs py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors flex items-center justify-center gap-1">
                  <UserPlus size={12} /> Admins
                </button>
                <button onClick={() => { setStatusModal(c); setStatusForm({ status: c.status || 'ACTIVE', reason: '' }); }}
                  className="flex-1 text-xs py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center justify-center gap-1">
                  <UserCheck size={12} /> Status
                </button>
                <button onClick={() => { setConfigModal(c); setConfigForm({ name: c.name, address: c.address, domain: c.domain, logoUrl: c.logoUrl, themeColor: c.themeColor, maxUsers: c.maxUsers }); }}
                  className="flex-1 text-xs py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors flex items-center justify-center gap-1">
                  <Settings size={12} /> Config
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Campus Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-bold text-white mb-5">New Campus</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          {[['Name', 'name', 'e.g. MIT Campus'], ['Code', 'code', 'e.g. MIT01'], ['Address', 'address', 'Campus address']].map(([label, key, ph]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">{label}</label>
              <input required value={createForm[key]} onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">Create Campus</button>
          </div>
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)}>
        <h2 className="text-lg font-bold text-white mb-2">Change Campus Status</h2>
        <p className="text-slate-400 text-sm mb-5">Campus: <span className="text-white">{statusModal?.name}</span></p>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">New Status</label>
            <select value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {statusForm.status === 'SUSPENDED' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">Reason</label>
              <textarea value={statusForm.reason} onChange={e => setStatusForm(f => ({ ...f, reason: e.target.value }))} rows={3}
                placeholder="Reason for suspension..."
                className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 resize-none" />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStatusModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button onClick={handleStatusChange} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm hover:bg-amber-700 transition-colors">Update Status</button>
          </div>
        </div>
      </Modal>

      {/* Config Modal */}
      <Modal open={!!configModal} onClose={() => setConfigModal(null)}>
        <h2 className="text-lg font-bold text-white mb-2">Campus Configuration</h2>
        <p className="text-slate-400 text-sm mb-5">Editing: <span className="text-white">{configModal?.name}</span></p>
        <div className="space-y-4">
          {[['Name', 'name'], ['Domain', 'domain'], ['Logo URL', 'logoUrl'], ['Theme Color', 'themeColor'], ['Max Users', 'maxUsers', 'number']].map(([label, key, type]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">{label}</label>
              <input type={type || 'text'} value={configForm[key] || ''} onChange={e => setConfigForm(f => ({ ...f, [key]: e.target.value }))}
                className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setConfigModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button onClick={handleConfigSave} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">Save Config</button>
          </div>
        </div>
      </Modal>

      {/* Add Admin Modal */}
      <Modal open={!!adminModal} onClose={() => setAdminModal(null)}>
        <h2 className="text-lg font-bold text-white mb-2">Add Campus Admin</h2>
        <p className="text-slate-400 text-sm mb-5">Campus: <span className="text-white">{adminModal?.name}</span></p>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">Admin Name *</label>
            <input required value={adminForm.name} onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe"
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">Admin Email *</label>
            <input required type="email" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} placeholder="john@campus.edu"
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">Phone (optional)</label>
            <input value={adminForm.phone} onChange={e => setAdminForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1234567890"
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAdminModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors">Create Admin</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
