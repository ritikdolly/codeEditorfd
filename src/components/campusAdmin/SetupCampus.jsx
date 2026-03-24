import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Hash, MapPin, Loader2 } from 'lucide-react';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export const SetupCampus = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [form, setForm] = useState({ name: '', code: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'join') {
      authService.getActiveCampuses().then(setCampuses).catch(e => toast.error('Failed to load campuses'));
    }
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'create' && (!form.name || !form.code)) return toast.error('Name & Code are required');
    if (mode === 'join' && !selectedCampusId) return toast.error('Please select an active campus');
    
    setLoading(true);
    try {
      let data;
      if (mode === 'create') {
        data = await authService.setupCampus(form);
      } else {
        data = await authService.joinCampus(selectedCampusId);
      }
      login(data.token, data.user);
      toast.success(mode === 'create' ? 'Campus setup complete!' : 'Successfully joined campus!');
      navigate('/campus-admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-800/60 border border-slate-700/50 p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Setup Your Campus</h2>
          <p className="text-slate-400 text-sm mt-2">
            Create a new campus environment or join an existing one.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-900/50 p-1 mb-6 border border-slate-700/50">
          <button type="button" onClick={() => setMode('create')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'create' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Create New</button>
          <button type="button" onClick={() => setMode('join')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'join' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Join Existing</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' ? (
            <>
              <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Campus/College Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Ex: Stanford University"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Campus Code *</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 uppercase"
                placeholder="Ex: STANFORD"
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Physical Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Optional"
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
              />
            </div>
          </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Select Active Campus *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-slate-500" size={18} />
                <select 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 appearance-none"
                  value={selectedCampusId}
                  onChange={(e) => setSelectedCampusId(e.target.value)}
                  required
                >
                  <option value="" disabled className="text-slate-500">Choose a campus...</option>
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Complete Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
