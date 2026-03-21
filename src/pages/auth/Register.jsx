import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import {
  Code2,
  Eye,
  EyeOff,
  Loader2,
  Rocket,
  ShieldCheck,
  Zap,
} from "lucide-react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.register(form);
      login(data.token, data.user);
      toast.success("Account created! Welcome to CodeArena!");
      navigate(`/${data.user.role.toLowerCase()}`);
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans bg-white">
      {/* ─── Left Side: Branding (Dark Mode) ─── */}
      <div className="w-full md:w-5/12 bg-[#09090b] relative p-10 md:p-16 flex flex-col justify-between min-h-[40vh] md:min-h-screen border-r border-gray-800">
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b] z-0 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-16 w-max">
            <div className="bg-[#2df07b] p-1.5 rounded text-black">
              <Code2 size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              CodeArena
            </span>
          </Link>

          <div className="mt-auto mb-auto max-w-sm">
            <h1 className="text-[36px] md:text-[42px] font-bold leading-tight text-white mb-6 tracking-tight">
              Start building <br />
              <span className="text-gray-400">the future today.</span>
            </h1>
            <p className="text-gray-400 text-[16px] leading-relaxed mb-12">
              Join our community of developers and educators to accelerate your learning and teaching experience.
            </p>

            <div className="space-y-6 hidden md:block">
              <div className="flex items-start gap-4">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-[#2df07b]">
                  <Rocket size={18} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Instant Setup</h4>
                  <p className="text-gray-500 text-[13px] mt-0.5">Cloud-ready environment in seconds.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-[#2df07b]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Secure Core</h4>
                  <p className="text-gray-500 text-[13px] mt-0.5">Enterprise isolation protocols active.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-sm text-gray-500 font-medium">
              © 2026 CodeArena Inc.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right Side: Register Form (Light Mode) ─── */}
      <div className="w-full md:w-7/12 bg-white p-8 md:p-16 flex flex-col justify-center min-h-screen">
        <div className="max-w-[480px] w-full mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
              Create Account
            </h2>
            <p className="text-gray-500 text-[15px]">
              Fill in your details to initialize your developer profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  className="w-full bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-gray-400"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  className="w-full bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-gray-400"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Identity Role
                </label>
                <select
                  className="w-full bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors appearance-none cursor-pointer font-medium"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-3 pr-12 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-gray-400"
                    type={showPassword ? "text" : "password"}
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 mb-4">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-offset-white cursor-pointer accent-black"
              />
              <p className="text-sm text-gray-600 leading-snug">
                I agree to the{" "}
                <a href="#" className="text-black font-bold hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-black font-bold hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : null}
              {loading ? "Deploying Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-[13px] font-bold uppercase tracking-wider">
                or join with
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-colors font-semibold text-gray-700 shadow-sm">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Google Authentication
            </button>
          </div>

          <p className="text-center text-gray-600 mt-10 text-[15px]">
            Already have an identity?{" "}
            <Link
              to="/login"
              className="text-black hover:underline font-bold"
            >
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
