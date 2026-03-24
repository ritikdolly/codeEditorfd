import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.forgotPassword({ email });
      toast.success(data.message || 'Password reset OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.resetPassword({ email, otp, newPassword });
      toast.success(data.message || 'Password successfully reset!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
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
            <p className="text-gray-300 text-sm mb-6">Account Recovery</p>
            <h1 className="text-[44px] md:text-[56px] font-bold leading-[1.15] text-white">
              Recover <br />
              Your <br />
              <span className="inline-block text-[#2df07b] border-2 border-[#2df07b] rounded-xl px-4 py-1 mt-3">
                Account
              </span>
            </h1>
          </div>

          {/* Feature Points */}
          <ul className="space-y-4 text-gray-200 text-sm">
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              We'll send an OTP to your registered email
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Set a new secure password instantly
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Get back to coding in seconds
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto md:ml-12">
          <h2 className="text-4xl font-light text-slate-800 mb-4">Forgot Password</h2>
          <p className="text-gray-500 text-sm mb-10">
            {step === 1
              ? "Enter your registered email address and we'll send you an OTP to reset your password."
              : `Enter the 6-digit OTP sent to ${email} and your new password.`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
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

              <div className="pt-2 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3.5 px-6 rounded-full transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? 'Sending...' : 'Send Recovery OTP'}
                </button>
                <Link
                  to="/login"
                  className="w-full bg-black hover:bg-gray-900 text-[#2df07b] font-bold py-3.5 px-6 rounded-full transition-all flex items-center justify-center text-sm shadow-sm active:scale-95"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="bg-[#2df07b]/10 border border-[#2df07b]/20 p-4 rounded-2xl text-slate-700 text-sm">
                Enter the 6-digit OTP sent to <strong>{email}</strong> and your new password.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Recovery OTP</label>
                <input
                  className="w-full bg-white border border-gray-200 rounded-full text-slate-800 px-6 py-3.5 tracking-[0.4em] text-center text-lg focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors placeholder:text-gray-400 placeholder:tracking-[0.4em] font-mono"
                  type="text"
                  placeholder="------"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    className="w-full bg-white border border-gray-200 rounded-full text-slate-800 px-6 py-3.5 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors pr-12 placeholder:text-gray-400"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
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

              <div className="pt-2 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6 || newPassword.length < 6}
                  className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3.5 px-6 rounded-full transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full bg-black hover:bg-gray-900 text-[#2df07b] font-bold py-3.5 px-6 rounded-full transition-all flex items-center justify-center text-sm shadow-sm active:scale-95"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
