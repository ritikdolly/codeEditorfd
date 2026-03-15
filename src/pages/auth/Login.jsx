import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      const role = data.user.role.toLowerCase();
      navigate(`/${role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans text-[#39424e]">
      
      {/* Left Side - Branding (White Background) */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-16">
          <Code2 size={24} className="text-[#1a1b1e]" />
          <span className="text-xl font-bold text-[#1a1b1e] tracking-tight">CodeArena<span className="text-[#4C8CE4]">_</span></span>
        </div>

        <div>
          <p className="text-[#576871] text-lg mb-4">Hey Developer,</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1b1e] leading-tight mb-12">
            Welcome to <br />
            CodeArena Platform
          </h1>

          <div className="flex gap-12 text-sm">
            <div>
              <span className="block text-[#576871] mb-1">Status</span>
              <span className="font-semibold text-[#39424e] text-base">Authentication</span>
            </div>
            <div>
              <span className="block text-[#576871] mb-1">Access</span>
              <span className="font-semibold text-[#39424e] text-base">Secure Login</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form (Light Grey Background) */}
      <div className="w-full md:w-1/2 bg-[#f3f4f6] p-8 md:p-16 lg:p-24 flex flex-col justify-center border-l border-gray-200">
        <div className="max-w-md w-full mx-auto md:ml-0">
          <h2 className="text-4xl font-light text-[#39424e] mb-8">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#39424e] mb-2">Email address</label>
              <input
                className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] transition-colors"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#39424e] mb-2">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] transition-colors pr-10"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Replicated the primary/secondary button styling from the image */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#4C8CE4] hover:bg-[#4C8CE4] text-white font-semibold py-2.5 px-6 rounded transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
              
              <Link 
                to="/register" 
                className="bg-white border border-[#4C8CE4] text-[#4C8CE4] hover:bg-gray-50 font-semibold py-2.5 px-6 rounded transition-colors"
              >
                Register Account
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}