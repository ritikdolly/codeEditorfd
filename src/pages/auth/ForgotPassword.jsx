import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Code2, ArrowLeft, Loader2, MailCheck } from "lucide-react";
import toast from "react-hot-toast";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating API call as there might not be a backend endpoint for this yet
    setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        toast.success("Reset link sent if account exists.");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans bg-white">
      {/* --- Left Side: Branding (Dark Mode) --- */}
      <div className="w-full md:w-5/12 bg-[#09090b] relative p-10 md:p-16 flex flex-col justify-between min-h-[40vh] md:min-h-screen border-r border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b] z-0 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-3 mb-16 w-max">
            <div className="bg-[#2df07b] p-1.5 rounded text-black">
              <Code2 size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">CodeArena</span>
          </Link>

          <div className="mt-auto mb-auto max-w-sm">
            <h1 className="text-[36px] md:text-[42px] font-bold leading-tight text-white mb-6 tracking-tight">
              Restore your <br />
              <span className="text-gray-400">session access.</span>
            </h1>
            <p className="text-gray-400 text-[16px] leading-relaxed">
              If you've misplaced your security credentials, we'll help you re-initialize your connection to the grid.
            </p>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-sm text-gray-500 font-medium">© 2026 CodeArena Inc.</p>
          </div>
        </div>
      </div>

      {/* --- Right Side: Form (Light Mode) --- */}
      <div className="w-full md:w-7/12 bg-white p-8 md:p-16 flex flex-col justify-center min-h-screen">
        <div className="max-w-[420px] w-full mx-auto">
          {!submitted ? (
            <>
              <div className="mb-10 text-center md:text-left">
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-gray-400 hover:text-black mb-6 transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
                <h2 className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">Reset Password</h2>
                <p className="text-gray-500 text-[15px]">
                  Enter your verified email address to receive recovery instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    className="w-full bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-gray-400"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={18} className="animate-spin text-white" /> : null}
                  {loading ? "Transmitting..." : "Send Recovery Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-[#2df07b] shadow-sm">
                <MailCheck size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-[32px] font-bold text-gray-900 mb-4 tracking-tight">Check your intake.</h2>
              <p className="text-gray-500 text-[16px] leading-relaxed mb-10">
                If an account matches **{email}**, recovery instructions have been dispatched. Please verify your inbox and spam folders.
              </p>
              <Link
                to="/login"
                className="inline-block bg-black hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-xl active:scale-95"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
