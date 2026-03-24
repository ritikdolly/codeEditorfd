import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('PASSWORD'); // 'PASSWORD', 'OTP_REQUEST', 'OTP_VERIFY'
  const [otp, setOtp] = useState('');
  const [googleLoginRole, setGoogleLoginRole] = useState('STUDENT');
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      const role = data.user.role.toLowerCase();
      navigate(`/${role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.requestLoginOtp({ email });
      toast.success(data.message || 'OTP sent to your email');
      setLoginMethod('OTP_VERIFY');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.loginOtp({ email, otp });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      const role = data.user.role.toLowerCase();
      navigate(`/${role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google login failed. Please check Authorized Origins in Google Cloud.');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.googleLogin({ token: credentialResponse.credential, role: googleLoginRole });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      const role = data.user.role.toLowerCase();
      navigate(`/${role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans">
      
      {/* Left Side - Branding */}
      <div className="w-full md:w-1/2 bg-[#09090b] p-10 md:p-16 lg:p-24 flex flex-col justify-center min-h-[50vh] md:min-h-screen">
        <div className="max-w-md w-full mx-auto md:ml-0 md:mr-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <span className="text-[#2df07b] font-bold text-xl">&lt;/&gt;</span>
            <span className="text-xl font-bold tracking-tight text-white">CodeArena_</span>
          </div>

          <div className="mb-12">
            <p className="text-gray-300 text-sm mb-6">Welcome Developer</p>
            <h1 className="text-[44px] md:text-[56px] font-bold leading-[1.15] text-white">
              Welcome To <br />
              <span className="inline-block text-[#2df07b] border-2 border-[#2df07b] rounded-xl px-4 py-1 mt-3 mb-3">
                CodeArena
              </span>{" "}
              <br />
              platform for <br />
              <span className="inline-block text-[#2df07b] border-2 border-[#2df07b] rounded-xl px-4 py-1 mt-3">
                Student
              </span>
            </h1>
          </div>

          {/* Feature Points */}
          <ul className="space-y-4 text-gray-200 text-sm">
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Create and manage coding challenges
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Real-time coding test environment
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Role based system for Admin, Teacher & Student
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto md:ml-12">
          <h2 className="text-4xl font-light text-slate-800 mb-10">Sign In</h2>

          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input
                className="w-full bg-white border border-gray-200 rounded-full text-slate-800 px-6 py-3.5 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors placeholder:text-gray-400"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-white border border-gray-200 rounded-full text-slate-800 px-6 py-3.5 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors pr-12 placeholder:text-gray-400 font-mono tracking-widest text-lg"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2df07b] focus:ring-[#2df07b]" />
                <span className="text-gray-500">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-slate-700 hover:text-[#2df07b] transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3.5 px-6 rounded-full transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
              
              <Link 
                to="/register" 
                className="flex-1 bg-black hover:bg-gray-900 text-[#2df07b] font-bold py-3.5 px-6 rounded-full transition-all flex items-center justify-center text-sm shadow-sm active:scale-95"
              >
                Register Account
              </Link>
            </div>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-400 bg-white">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 rounded-full py-3.5 hover:bg-gray-50 transition-colors shadow-sm">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span className="font-medium text-slate-700 text-sm">Continue with Google</span>
          </button>

        </div>
      </div>
    </div>
  );
}
