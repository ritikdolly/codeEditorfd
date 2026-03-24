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
              Create An <br />
              <span className="inline-block text-[#2df07b] border-2 border-[#2df07b] rounded-xl px-4 py-1 mt-3 mb-3">
                Account
              </span>{" "}
              <br />
              on the <br />
              <span className="inline-block text-[#2df07b] border-2 border-[#2df07b] rounded-xl px-4 py-1 mt-3">
                Platform
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
          <h2 className="text-4xl font-light text-slate-800 mb-10">
            {step === 1 ? 'Register' : 'Verify Email'}
          </h2>

          {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                className="w-full bg-white border border-gray-200 rounded-full text-slate-800 px-6 py-3.5 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors placeholder:text-gray-400"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input
                className="w-full bg-white border border-gray-200 rounded-full text-slate-800 px-6 py-3.5 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors placeholder:text-gray-400"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-white border border-gray-200 rounded-full text-slate-800 px-6 py-3.5 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors pr-12 placeholder:text-gray-400 font-mono tracking-widest text-lg"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
              <select
                className="w-full bg-white border border-gray-200 rounded-full text-slate-800 px-6 py-3.5 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors appearance-none cursor-pointer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3.5 px-6 rounded-full transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Creating Account..." : "Register"}
              </button>

              <Link
                to="/login"
                className="flex-1 bg-black hover:bg-gray-900 text-[#2df07b] font-bold py-3.5 px-6 rounded-full transition-all flex items-center justify-center text-sm shadow-sm active:scale-95"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
          ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="bg-[#2df07b]/10 border border-[#2df07b]/20 p-4 rounded-2xl text-slate-700 text-sm">
              We sent a 6-digit verification code to <strong>{form.email}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
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

            <div className="pt-2 flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3.5 px-6 rounded-full transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full bg-black hover:bg-gray-900 text-[#2df07b] font-bold py-3.5 px-6 rounded-full transition-all flex items-center justify-center text-sm shadow-sm active:scale-95"
              >
                Go Back
              </button>
            </div>
          </form>
          )}

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
