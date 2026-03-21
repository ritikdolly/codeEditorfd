import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Code2, Eye, EyeOff, Loader2 } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans bg-white">
      {/* ─── Left Side: Branding (Dark Mode) ─── */}
      <div className="w-full md:w-5/12 bg-[#09090b] relative p-10 md:p-16 flex flex-col justify-between min-h-[40vh] md:min-h-screen border-r border-gray-800">
        {/* Faint Background Pattern */}
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "url('/image_6d4f00.jpg')", // Make sure the path matches your public folder
            backgroundSize: "300px",
          }}
        ></div>

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
              Welcome back to your workspace.
            </h1>
            <p className="text-gray-400 text-[16px] leading-relaxed">
              Log in to access your coding environment, manage your projects,
              and track your progress.
            </p>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-sm text-gray-500 font-medium">
              © 2026 CodeArena Inc.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right Side: Login Form (Light Mode) ─── */}
      <div className="w-full md:w-7/12 bg-white p-8 md:p-16 flex flex-col justify-center min-h-screen">
        <div className="max-w-[420px] w-full mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
              Sign In
            </h2>
            <p className="text-gray-500 text-[15px]">
              Enter your email and password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                className="w-full bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-gray-400"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-3 pr-12 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-gray-400"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            <div className="flex items-center justify-between pt-1 mb-6 px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-offset-white cursor-pointer accent-black"
                />
                <span className="text-[14px] text-gray-600 group-hover:text-black transition-colors font-medium">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[14px] text-black hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-[13px] font-bold uppercase tracking-wider">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-colors font-semibold text-gray-700 shadow-sm">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Google
            </button>
          </div>

          <p className="text-center text-gray-600 mt-10 text-[15px]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-black hover:underline font-bold"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
