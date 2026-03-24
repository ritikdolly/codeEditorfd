import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { batchService, departmentService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

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

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm text-slate-400">{label}</label>
    <input {...props} className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors" />
  </div>
);

export const BatchManagement = () => {
  const { user } = useAuthStore();
  const campusId = user?.campusId;
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState({});
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(null); // batchId
  const [batchForm, setBatchForm] = useState({ name: '', year: new Date().getFullYear(), departmentId: '', campusId });
  const [sectionForm, setSectionForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campusId) return;
    setLoading(true);
    Promise.all([departmentService.getByCampus(campusId), batchService.getByCampus(campusId)])
      .then(([d, b]) => { setDepts(d); setBatches(b); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [campusId]);

  const loadSections = async (batchId) => {
    if (sections[batchId]) { setExpandedBatch(batchId === expandedBatch ? null : batchId); return; }
    try {
      const data = await batchService.getSections(batchId);
      setSections(s => ({ ...s, [batchId]: data }));
      setExpandedBatch(batchId);
    } catch { toast.error('Failed to load sections'); }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await batchService.create({ ...batchForm, campusId, year: Number(batchForm.year) });
      toast.success('Batch created!');
      setShowBatchModal(false);
      const b = await batchService.getByCampus(campusId);
      setBatches(b);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      const newSection = await batchService.createSection(showSectionModal, { ...sectionForm, batchId: showSectionModal });
      toast.success('Section created!');
      setSections(s => ({ ...s, [showSectionModal]: [...(s[showSectionModal] || []), newSection] }));
      setShowSectionModal(null);
      setSectionForm({ name: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Layers size={22} className="text-emerald-400" /> Batches & Sections</h1>
          <p className="text-slate-400 text-sm mt-1">Organize students into batches and sections</p>
        </div>
        <button onClick={() => setShowBatchModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> New Batch
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading...</div>
      ) : batches.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-slate-400 py-16">
          <Layers size={40} className="opacity-40" />
          <p className="text-sm">No batches yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              {/* Batch Header */}
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-700/20 transition-colors"
                onClick={() => loadSections(b.id)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Layers size={16} /></div>
                  <div>
                    <p className="font-semibold text-white">{b.name}</p>
                    <p className="text-xs text-slate-400">Year: {b.year} · Dept: {depts.find(d => d.id === b.departmentId)?.name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={e => { e.stopPropagation(); setShowSectionModal(b.id); }}
                    className="text-xs text-purple-400 border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors">
                    + Section
                  </button>
                  {expandedBatch === b.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>
              {/* Sections */}
              <AnimatePresence>
                {expandedBatch === b.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-4 pt-0 border-t border-slate-700/40">
                      {(sections[b.id] || []).length === 0 ? (
                        <p className="text-slate-400 text-sm py-3 text-center">No sections yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3">
                          {(sections[b.id] || []).map(s => (
                            <div key={s.id} className="bg-slate-700/40 border border-slate-600/40 rounded-xl px-4 py-3">
                              <p className="text-white font-medium text-sm">{s.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">Teacher: {s.teacherName || '—'}</p>
                              <p className="text-xs text-slate-400">Mentor: {s.mentorName || '—'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Batch Modal */}
      <Modal open={showBatchModal} onClose={() => setShowBatchModal(false)}>
        <h2 className="text-lg font-bold text-white mb-5">New Batch</h2>
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <Input label="Batch Name" required value={batchForm.name} onChange={e => setBatchForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 2024-Batch-A" />
          <Input label="Year" type="number" required value={batchForm.year} onChange={e => setBatchForm(f => ({ ...f, year: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">Department</label>
            <select required value={batchForm.departmentId} onChange={e => setBatchForm(f => ({ ...f, departmentId: e.target.value }))}
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              <option value="">-- Select Department --</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowBatchModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors">Create Batch</button>
          </div>
        </form>
      </Modal>

      {/* Create Section Modal */}
      <Modal open={!!showSectionModal} onClose={() => setShowSectionModal(null)}>
        <h2 className="text-lg font-bold text-white mb-5">New Section</h2>
        <form onSubmit={handleCreateSection} className="space-y-4">
          <Input label="Section Name" required value={sectionForm.name} onChange={e => setSectionForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Section A" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowSectionModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors">Create Section</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
