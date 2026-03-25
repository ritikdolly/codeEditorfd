import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Code2, Eye, EyeOff, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("PASSWORD"); // 'PASSWORD', 'OTP_REQUEST', 'OTP_VERIFY'
  const [otp, setOtp] = useState("");
  const [googleLoginRole, setGoogleLoginRole] = useState("STUDENT");

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      const role = data.user.role.toUpperCase();
      if (role === "SUPER_ADMIN") navigate("/admin");
      else if (role === "CAMPUS_ADMIN") navigate("/campus-admin");
      else navigate(`/${role.toLowerCase()}`);
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
      toast.success(data.message || "OTP sent to your email");
      setLoginMethod("OTP_VERIFY");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
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
      const role = data.user.role.toUpperCase();
      if (role === "SUPER_ADMIN") navigate("/admin");
      else if (role === "CAMPUS_ADMIN") navigate("/campus-admin");
      else navigate(`/${role.toLowerCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error(
        "Google login failed. Please check Authorized Origins in Google Cloud.",
      );
      return;
    }
    setLoading(true);
    try {
      const data = await authService.googleLogin({
        token: credentialResponse.credential,
        role: googleLoginRole,
      });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      const role = data.user.role.toUpperCase();
      if (role === "SUPER_ADMIN") navigate("/admin");
      else if (role === "CAMPUS_ADMIN") navigate("/campus-admin");
      else navigate(`/${role.toLowerCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Google verification failed.");
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
            <span className="text-accent font-bold text-xl">&lt;/&gt;</span>
            <span className="text-xl font-bold tracking-tight text-white">
              CodeArena_
            </span>
          </div>

          <div className="mb-12">
            <p className="text-gray-300 text-sm mb-6">Welcome Developer</p>
            <h1 className="text-[44px] md:text-[56px] font-bold leading-[1.15] text-white">
              Welcome To <br />
              <span className="inline-block text-accent border-2 border-accent rounded-xl px-4 py-1 mt-3 mb-3">
                CodeArena
              </span>{" "}
              <br />
              platform for <br />
              <span className="inline-block text-accent border-2 border-accent rounded-xl px-4 py-1 mt-3">
                Student
              </span>
            </h1>
          </div>

          {/* Feature Points */}
          <ul className="space-y-4 text-gray-200 text-sm">
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-accent shrink-0"></div>
              Create and manage coding challenges
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-accent shrink-0"></div>
              Real-time coding test environment
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-accent shrink-0"></div>
              Role based system for Admin, Teacher & Student
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto md:ml-12">
          <h2 className="text-4xl font-light text-slate-800 mb-10">Sign In</h2>

          {loginMethod === "OTP_VERIFY" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded text-blue-800 text-sm mb-6">
                Enter the 6-digit OTP sent to <strong>{email}</strong>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">
                  Login OTP
                </label>
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
              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-[#4C8CE4] hover:bg-[#4C8CE4] text-white font-semibold py-2.5 px-6 rounded flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Verify & Sign In"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("PASSWORD")}
                  className="w-full bg-white border border-[#c2c7d0] text-[#39424e] font-semibold py-2.5 px-6 rounded"
                >
                  Back to Login Options
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={
                loginMethod === "PASSWORD"
                  ? handlePasswordLogin
                  : handleRequestOtp
              }
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-[#39424e] mb-2">
                  Email address
                </label>
                <input
                  className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] transition-colors"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {loginMethod === "PASSWORD" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-[#39424e]">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-[#4C8CE4] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] pr-10"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
              )}

              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4C8CE4] hover:bg-[#4C8CE4] text-white font-semibold py-2.5 px-6 rounded flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {loginMethod === "PASSWORD"
                    ? "Sign In with Password"
                    : "Send Login OTP"}
                </button>

                {loginMethod === "PASSWORD" ? (
                  <button
                    type="button"
                    onClick={() => setLoginMethod("OTP_REQUEST")}
                    className="w-full bg-white border border-[#4C8CE4] text-[#4C8CE4] font-semibold py-2.5 px-6 rounded transition-colors"
                  >
                    Passwordless Login (OTP)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLoginMethod("PASSWORD")}
                    className="w-full bg-white border border-[#c2c7d0] text-[#39424e] font-semibold py-2.5 px-6 rounded transition-colors"
                  >
                    Use Password Instead
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex justify-center w-full mb-6">
            <div className="w-full">
              <label className="block text-sm font-medium text-[#39424e] mb-2 text-center">
                Signing in with Google as...
              </label>
              <select
                className="w-full bg-white border border-[#c2c7d0] rounded text-[#39424e] px-4 py-2.5 focus:outline-none focus:border-[#4C8CE4] focus:ring-1 focus:ring-[#4C8CE4] transition-colors appearance-none cursor-pointer text-center"
                value={googleLoginRole}
                onChange={(e) => setGoogleLoginRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              /* Google Login Logic handled by GoogleOAuthProvider in main.jsx */
            }}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 rounded-full py-3.5 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="font-medium text-slate-700 text-sm">
              Continue with Google
            </span>
          </button>
          <Link
            to="/register"
            className="mt-5 flex-2 flex items-center justify-center bg-white hover:bg-gray-500 text-accent font-bold py-3.5 px-6 rounded-full transition-all text-sm shadow-sm active:scale-95"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
