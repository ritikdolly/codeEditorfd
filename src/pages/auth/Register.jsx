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
            <p className="text-gray-300 text-[17px] mb-6">Start Your Journey</p>

            <h1 className="text-[44px] md:text-[56px] font-bold leading-[1.15] text-white">
              Create an <br />
              <span className="inline-block text-[#2df07b] border-2 border-[#2df07b] rounded-xl px-4 py-1 mt-3 mb-3">
                Account
              </span>{" "}
              <br />
              on the <br />
              <span className="inline-block text-[#2df07b] border border-[#2df07b] rounded-xl px-4 py-1 mt-3">
                Platform
              </span>
            </h1>
          </div>

          {/* Feature Points */}
          <ul className="space-y-4 text-gray-200 text-[15px]">
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Join thousands of students and teachers
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Set up your environment in seconds
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Start coding and deploying today
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form (White Background) */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-[32px] md:text-[40px] font-light text-slate-800 mb-8">
            Register
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                className="w-full bg-white border border-gray-300 rounded-full text-slate-800 px-5 py-3 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <input
                className="w-full bg-white border border-gray-300 rounded-full text-slate-800 px-5 py-3 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                I am a...
              </label>
              <select
                className="w-full bg-white border border-gray-300 rounded-full text-slate-800 px-5 py-3 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors appearance-none cursor-pointer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            {/* Terms and Conditions isolated in its own clean row */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 text-[#2df07b] border-gray-300 rounded focus:ring-[#2df07b] cursor-pointer"
              />
              <p className="text-sm text-gray-500 leading-tight mt-0.5">
                I agree to CodeArena's{" "}
                <Link
                  to="#"
                  className="text-slate-700 hover:text-[#2df07b] hover:underline font-medium transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="#"
                  className="text-slate-700 hover:text-[#2df07b] hover:underline font-medium transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Buttons Row */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-semibold py-3.5 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : null}
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* Alternate Login Methods */}
          <div className="mt-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm font-medium">
                or register with
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-full py-3.5 hover:bg-gray-50 transition-colors">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="font-medium text-slate-700">
                Continue with Google
              </span>
            </button>
          </div>

          {/* Clean Sign In Link at the bottom */}
          <p className="text-center text-gray-500 mt-8 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-slate-700 hover:text-[#2df07b] hover:underline transition-colors font-semibold"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
