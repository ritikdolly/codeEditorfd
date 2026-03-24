import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Code2, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
 
export function ForcePasswordChange() {
  const [step, setStep] = useState(1);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const navigate = useNavigate();
  const { user, login, token } = useAuthStore();
 
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);
 
  const roleHome = {
    super_admin: '/admin',
    platform_staff: '/admin',
    campus_admin: '/campus-admin',
    campus_staff: '/staff',
    dean: '/dean',
    hod: '/hod',
    mentor: '/mentor',
    teacher: '/teacher',
    student: '/student',
  };
 
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await authService.requestChangePasswordOtp();
      toast.success('Verification OTP sent to your email');
      setStep(2);
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword === oldPassword) {
      toast.error('New password must be different from the temporary one');
      return;
    }
 
    setLoading(true);
    try {
      await authService.changePassword({ oldPassword, newPassword, otp });
      
      const updatedUser = { ...user, mustChangePassword: false };
      login(token, updatedUser);
      
      toast.success('Password updated successfully!');
      setTimeout(() => {
        const userRole = user.role?.toLowerCase();
        navigate(roleHome[userRole] || '/login');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
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
            Secure your <br />
            Account
          </h1>
          <p className="text-[#576871] text-lg max-w-sm">
            Your account was created with temporary credentials. Let's set up a secure password to protect your data.
          </p>
        </div>
      </div>
 
      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-[#f3f4f6] p-8 md:p-16 lg:p-24 flex flex-col justify-center border-l border-gray-200">
        <div className="max-w-md w-full mx-auto md:ml-0">
          <h2 className="text-4xl font-light text-[#39424e] mb-8">Password Update</h2>
 
          {step === 1 ? (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm flex gap-3">
                <ShieldCheck className="shrink-0 text-amber-600" size={20} />
                <p>To continue, we need to verify your email address. We'll send a 6-digit code to <strong>{user?.email}</strong>.</p>
              </div>
              
              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="w-full bg-[#4C8CE4] hover:bg-[#3b7bd1] text-white font-semibold py-3 px-6 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  Send Verification OTP
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded text-blue-800 text-sm mb-6">
                Enter the OTP sent to your email and set your new secure password.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">Verification Code</label>
                <input
                  className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 tracking-[0.5em] text-center text-lg font-mono focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4]"
                  type="text"
                  placeholder="------"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="text-[#576871]">Didn't get the code?</span>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={timer > 0 || loading}
                    className="text-[#4C8CE4] hover:underline font-bold disabled:text-gray-400"
                  >
                    {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
 
              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">Temporary Password</label>
                <div className="relative">
                  <input
                    className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] pr-10"
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder="Current temporary password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
 
              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">New Password/Confirm Password</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <input
                      className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] pr-10"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="New password (min 8 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <input
                    className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4]"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
 
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6 || newPassword.length < 8}
                  className="w-full bg-[#4C8CE4] hover:bg-[#3b7bd1] text-white font-semibold py-3 px-6 rounded flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 transition-all"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Secure Reset'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
