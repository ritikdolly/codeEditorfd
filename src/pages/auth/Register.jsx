import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Code2, Loader2 } from 'lucide-react';

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.register(form);
      login(data.token, data.user);
      toast.success('Account created! Welcome to CodeArena!');
      navigate(`/${data.user.role.toLowerCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.email || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-gradient)' }}>
      <div className="glass-card w-full max-w-md p-8 auth-card">
        <div className="flex flex-col items-center mb-8">
          <div className="icon-badge mb-4">
            <Code2 size={28} className="text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Join CodeArena</h1>
          <p className="text-slate-400 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label">Full Name</label>
            <input className="field-input" type="text" placeholder="John Doe" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="field-input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="field-label">I am a...</label>
            <select className="field-input" value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
