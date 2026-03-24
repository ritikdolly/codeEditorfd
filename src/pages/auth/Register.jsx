import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Code2, Eye, EyeOff, Loader2 } from "lucide-react";

export function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.register(form);
      toast.success(data.message || "OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(
        err.response?.data?.email ||
          err.response?.data?.message ||
          "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.verifyRegistration({ email: form.email, otp });
      login(data.token, data.user);
      toast.success("Account verified! Welcome to CodeArena!");
      const role = data.user.role.toUpperCase();
      if (role === 'SUPER_ADMIN') navigate('/admin');
      else if (role === 'CAMPUS_ADMIN') navigate('/campus-admin');
      else navigate(`/${role.toLowerCase()}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Verification failed. Please check your OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans text-[#39424e]">
      {/* Right Side - Form (Light Grey Background) */}
      <div className="w-full md:w-1/2 bg-[#f3f4f6] p-8 md:p-16 lg:p-24 flex flex-col justify-center border-l border-gray-200">
        <div className="max-w-md w-full mx-auto md:ml-0">
          <h2 className="text-4xl font-light text-[#39424e] mb-8">
            Create Account
          </h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">
                  Full Name
                </label>
                <input
                  className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] transition-colors"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">
                  Email address
                </label>
                <input
                  className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] transition-colors"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] transition-colors"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
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

              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">
                  I am a...
                </label>
                <select
                  className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] transition-colors appearance-none cursor-pointer"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="CAMPUS_ADMIN">Campus Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#4C8CE4] hover:bg-[#4C8CE4] text-white font-semibold py-2.5 px-6 rounded transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {loading ? "Creating Account..." : "Register"}
                </button>

                <Link
                  to="/login"
                  className="bg-white border border-[#4C8CE4] text-[#4C8CE4] hover:bg-gray-50 font-semibold py-2.5 px-6 rounded transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded text-blue-800 text-sm mb-6">
                We've sent a 6-digit OTP to <strong>{form.email}</strong>. Please enter it below to verify your account.
              </div>
              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">
                  Verification OTP
                </label>
                <input
                  className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] tracking-widest text-center text-lg"
                  type="text"
                  placeholder="------"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="bg-[#4C8CE4] hover:bg-[#4C8CE4] w-full text-white font-semibold py-2.5 px-6 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full bg-white border border-[#c2c7d0] text-[#39424e] hover:bg-gray-50 font-semibold py-2.5 px-6 rounded transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Left Side - Branding (White Background) */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-16">
          <Code2 size={24} className="text-[#1a1b1e]" />
          <span className="text-xl font-bold text-[#1a1b1e] tracking-tight">
            CodeArena<span className="text-[#4C8CE4]">_</span>
          </span>
        </div>

        <div>
          <p className="text-[#576871] text-lg mb-4">Start your journey,</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1b1e] leading-tight mb-12">
            Join the <br />
            CodeArena Platform
          </h1>

          <div className="flex gap-12 text-sm">
            <div>
              <span className="block text-[#576871] mb-1">Status</span>
              <span className="font-semibold text-[#39424e] text-base">
                New Account
              </span>
            </div>
            <div>
              <span className="block text-[#576871] mb-1">Access</span>
              <span className="font-semibold text-[#39424e] text-base">
                Registration
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
