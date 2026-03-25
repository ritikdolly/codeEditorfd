import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, KeyRound, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { passwordResetService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // email | token | done
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await passwordResetService.request({ email });
      toast.success('Reset email sent! Check your inbox.');
      setStep('token');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally { setLoading(false); }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await passwordResetService.confirm({ token, newPassword: password });
      setStep('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Token may be expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-accent/10 blur-[120px] rounded-full pointer-events-none opacity-40"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-3xl p-8 w-full max-w-md shadow-2xl">

        {/* Icon header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-2xl bg-accent/20 mb-4">
            <Lock size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 'done' ? 'Password Reset!' : 'Reset Password'}
          </h1>
          <p className="text-slate-400 text-sm mt-2 text-center">
            {step === 'email' && 'Enter your email to receive a reset link'}
            {step === 'token' && 'Enter the token from your email and your new password'}
            {step === 'done' && 'Your password has been changed successfully'}
          </p>
        </div>

        {/* Step: Email */}
        {step === 'email' && (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600/60 rounded-xl text-white focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent-dark text-black font-medium transition-colors disabled:opacity-60">
              {loading ? 'Sending…' : <><ArrowRight size={16} />Send Reset Email</>}
            </button>
            <button type="button" onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white text-sm transition-colors">
              ← Back to Login
            </button>
          </form>
        )}

        {/* Step: Token + New Password */}
        {step === 'token' && (
          <form onSubmit={handleConfirmReset} className="space-y-5">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-emerald-400">
              Reset email sent to <span className="font-medium">{email}</span>. Check your inbox.
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">Reset Token</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required value={token} onChange={e => setToken(e.target.value)}
                  placeholder="Paste token from email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600/60 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">New Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600/60 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors pr-10" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">Confirm Password</label>
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600/60 rounded-xl text-white focus:outline-none focus:border-accent transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent-dark text-black font-medium transition-colors disabled:opacity-60">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="text-center space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-emerald-400" />
            </motion.div>
            <p className="text-slate-300 text-sm">You can now log in with your new password.</p>
            <button onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-dark text-black font-medium transition-colors">
              Go to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
