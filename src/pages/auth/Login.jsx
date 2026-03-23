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
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans">
      {/* Left Side - Branding (Black Background) */}
      <div className="w-full md:w-1/2 bg-black p-10 md:p-16 lg:p-24 flex flex-col justify-center min-h-[50vh] md:min-h-screen">
        <div className="max-w-md w-full mx-auto md:ml-0 md:mr-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <Code2 size={26} className="text-[#2df07b]" />
            <span className="text-2xl font-bold tracking-tight text-white">
              CodeArena_
            </span>
          </div>

          <div className="mb-12">
            <p className="text-gray-300 text-[17px] mb-6">Welcome Developer</p>

            <h1 className="text-[44px] md:text-[56px] font-bold leading-[1.15] text-white">
              Welcome To <br />
              <span className="inline-block text-[#2df07b] border-2 border-[#2df07b] rounded-xl px-4 py-1 mt-3 mb-3">
                CodeArena
              </span>{" "}
              <br />
              platform for <br />
              <span className="inline-block text-[#2df07b] border border-[#2df07b] rounded-xl px-4 py-1 mt-3">
                Student
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Right Side - Form (White Background) */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-[32px] md:text-[40px] font-light text-slate-800 mb-8">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <input
                className="w-full bg-white border border-gray-300 rounded-full text-slate-800 px-5 py-3 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-white border border-gray-300 rounded-full text-slate-800 px-5 py-3 pr-12 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 px-1">
                {/* Remember Me */}
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#2df07b] border-gray-300 rounded focus:ring-[#2df07b]"
                  />
                  Remember me
                </label>

                {/* Forgot Password */}
                <Link
                  to="/forgot-password"
                  className="text-sm text-slate-700 hover:text-[#2df07b] hover:underline transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-1/2 bg-[#2df07b] hover:bg-[#25c464] text-black font-semibold py-3.5 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : null}
                {loading ? "Authenticating..." : "Sign In"}
              </button>

              <Link
                to="/register"
                className="w-full sm:w-1/2 bg-black hover:bg-gray-900 text-[#2df07b] font-semibold py-3.5 px-6 rounded-full transition-colors flex items-center justify-center border border-black"
              >
                Register Account
              </Link>
            </div>
          </form>

          {/* Alternate Login Methods */}
          <div className="mt-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-full py-3.5 hover:bg-gray-50 transition-colors">
             
              <span className="font-medium text-slate-700">
                Continue with Google
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
