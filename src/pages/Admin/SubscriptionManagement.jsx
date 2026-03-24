import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Pencil, Calendar, RefreshCw } from 'lucide-react';
import { subscriptionService, campusService } from '../../services/api';
import toast from 'react-hot-toast';

const TIER_COLOR = {
  FREE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  PREMIUM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ENTERPRISE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
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

export const SubscriptionManagement = () => {
  const [plans, setPlans] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', tier: 'FREE', maxUsers: 100, maxCampuses: 1, priceMonthly: '', priceYearly: '', featuresJson: '' });
  const [assignForm, setAssignForm] = useState({ campusId: '', planId: '', expiryDate: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([subscriptionService.getAllPlans(), campusService.getAll()]);
      setPlans(p); setCampuses(c);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      if (editPlan) { await subscriptionService.updatePlan(editPlan.id, planForm); toast.success('Plan updated!'); setEditPlan(null); }
      else { await subscriptionService.createPlan(planForm); toast.success('Plan created!'); setShowCreate(false); }
      setPlanForm({ name: '', tier: 'FREE', maxUsers: 100, maxCampuses: 1, priceMonthly: '', priceYearly: '', featuresJson: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await subscriptionService.assignPlan(assignForm);
      toast.success('Plan assigned to campus!');
      setShowAssign(false);
      setAssignForm({ campusId: '', planId: '', expiryDate: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const openEdit = (p) => {
    setEditPlan(p);
    setPlanForm({ name: p.name, tier: p.tier, maxUsers: p.maxUsers, maxCampuses: p.maxCampuses, priceMonthly: p.priceMonthly || '', priceYearly: p.priceYearly || '', featuresJson: p.featuresJson || '' });
  };

  const PlanForm = ({ onClose }) => (
    <form onSubmit={handleSavePlan} className="space-y-4">
      {[['Plan Name', 'name', 'text'], ['Max Users', 'maxUsers', 'number'], ['Max Campuses', 'maxCampuses', 'number'], ['Monthly Price ($)', 'priceMonthly', 'number'], ['Yearly Price ($)', 'priceYearly', 'number']].map(([label, key, type]) => (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">{label}</label>
          <input type={type} required={['name', 'maxUsers', 'maxCampuses'].includes(key)} value={planForm[key]}
            onChange={e => setPlanForm(f => ({ ...f, [key]: e.target.value }))}
            className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-slate-400">Tier</label>
        <select value={planForm.tier} onChange={e => setPlanForm(f => ({ ...f, tier: e.target.value }))}
          className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
          {['FREE', 'PREMIUM', 'ENTERPRISE'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">{editPlan ? 'Update Plan' : 'Create Plan'}</button>
      </div>
    </form>
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Layers size={22} className="text-indigo-400" /> Subscription Management</h1>
          <p className="text-slate-400 text-sm mt-1">Create plans and assign them to campuses</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setShowAssign(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Calendar size={16} /> Assign Plan
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> New Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-16">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-slate-400 py-16"><Layers size={40} className="opacity-40" /><p className="text-sm">No subscription plans yet.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`bg-slate-800/60 border rounded-2xl p-5 space-y-4 hover:border-slate-600/60 transition-all ${p.tier === 'ENTERPRISE' ? 'border-amber-500/30' : p.tier === 'PREMIUM' ? 'border-blue-500/30' : 'border-slate-700/50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-white text-lg">{p.name}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TIER_COLOR[p.tier]}`}>{p.tier}</span>
                </div>
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"><Pencil size={14} /></button>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-400"><span>Max Users</span><span className="text-white font-medium">{p.maxUsers.toLocaleString()}</span></div>
                <div className="flex justify-between text-slate-400"><span>Max Campuses</span><span className="text-white font-medium">{p.maxCampuses}</span></div>
                {p.priceMonthly && <div className="flex justify-between text-slate-400"><span>Monthly</span><span className="text-emerald-400 font-medium">${p.priceMonthly}</span></div>}
                {p.priceYearly && <div className="flex justify-between text-slate-400"><span>Yearly</span><span className="text-emerald-400 font-medium">${p.priceYearly}</span></div>}
              </div>
              {!p.isActive && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-1.5 border border-red-500/20">Inactive</div>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-lg font-bold text-white mb-5">New Subscription Plan</h2>
        <PlanForm onClose={() => setShowCreate(false)} />
      </Modal>

      {/* Edit Plan Modal */}
      <Modal open={!!editPlan} onClose={() => setEditPlan(null)}>
        <h2 className="text-lg font-bold text-white mb-5">Edit Plan: {editPlan?.name}</h2>
        <PlanForm onClose={() => setEditPlan(null)} />
      </Modal>

      {/* Assign Plan Modal */}
      <Modal open={showAssign} onClose={() => setShowAssign(false)}>
        <h2 className="text-lg font-bold text-white mb-5">Assign Plan to Campus</h2>
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">Campus</label>
            <select required value={assignForm.campusId} onChange={e => setAssignForm(f => ({ ...f, campusId: e.target.value }))}
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
              <option value="">-- Select Campus --</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">Plan</label>
            <select required value={assignForm.planId} onChange={e => setAssignForm(f => ({ ...f, planId: e.target.value }))}
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
              <option value="">-- Select Plan --</option>
              {plans.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} ({p.tier})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">Expiry Date</label>
            <input type="date" required value={assignForm.expiryDate} onChange={e => setAssignForm(f => ({ ...f, expiryDate: e.target.value }))}
              className="bg-slate-800 border border-slate-600/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAssign(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors">Assign Plan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
