import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans text-[#39424e]">
      
      {/* Left Side - Branding */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-16">
          <Code2 size={24} className="text-[#1a1b1e]" />
          <span className="text-xl font-bold text-[#1a1b1e] tracking-tight">CodeArena<span className="text-[#4C8CE4]">_</span></span>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1b1e] leading-tight mb-6">
            Recover your <br />
            Account
          </h1>
          <p className="text-[#576871] text-lg max-w-sm">
            Don't worry, it happens to the best of us. Let's get you back into the CodeArena platform.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-[#f3f4f6] p-8 md:p-16 lg:p-24 flex flex-col justify-center border-l border-gray-200">
        <div className="max-w-md w-full mx-auto md:ml-0">
          <h2 className="text-4xl font-light text-[#39424e] mb-8">Forgot Password</h2>

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <p className="text-sm text-[#576871] mb-6">
                Enter your registered email address and we'll send you an OTP to reset your password.
              </p>
              
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

              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4C8CE4] hover:bg-[#4C8CE4] text-white font-semibold py-2.5 px-6 rounded flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  Send Recovery OTP
                </button>
                <div className="text-center mt-4">
                  <Link to="/login" className="text-[#4C8CE4] hover:underline font-medium">Back to Sign In</Link>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded text-blue-800 text-sm mb-6">
                Enter the 6-digit OTP sent to <strong>{email}</strong> and your new password.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">Recovery OTP</label>
                <input
                  className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 tracking-widest text-center text-lg focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4]"
                  type="text"
                  placeholder="------"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">New Password</label>
                <div className="relative">
                  <input
                    className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] pr-10"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
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

              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6 || newPassword.length < 6}
                  className="w-full bg-[#4C8CE4] hover:bg-[#4C8CE4] text-white font-semibold py-2.5 px-6 rounded flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full bg-white border border-[#c2c7d0] text-[#39424e] font-semibold py-2.5 px-6 rounded"
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
