import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Code2, ArrowLeft, Loader2, MailCheck, Zap, Globe } from "lucide-react";
import toast from "react-hot-toast";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        toast.success("Recovery vector transmitted. Check your intake.");
    }, 1500);
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
            <p className="text-gray-300 text-[17px] mb-6">Password Recovery</p>

            <h1 className="text-[44px] md:text-[56px] font-bold leading-[1.15] text-white">
              Recover Your <br />
              <span className="inline-block text-[#2df07b] border-2 border-[#2df07b] rounded-xl px-4 py-1 mt-3 mb-3">
                Account
              </span>{" "}
              <br />
              access for <br />
              <span className="inline-block text-[#2df07b] border border-[#2df07b] rounded-xl px-4 py-1 mt-3">
                CodeArena
              </span>
            </h1>
          </div>

          {/* Feature Points */}
          <ul className="space-y-4 text-gray-200 text-[15px]">
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Secure password recovery process
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Regain access to your workflows
            </li>
            <li className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#2df07b] shrink-0"></div>
              Resume your role seamlessly
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form (White Background) */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-gray-500 hover:text-slate-800 mb-6 transition-colors text-[11px] font-bold uppercase tracking-widest group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Return to Login
          </button>

          {!submitted ? (
            <>
              <h2 className="text-[32px] md:text-[40px] font-light text-slate-800 mb-2">
                Recover access
              </h2>
              <p className="text-slate-500 text-sm mb-8">Enter your email to receive recovery instructions.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Verified Email
                  </label>
                  <input
                    className="w-full bg-white border border-gray-300 rounded-full text-slate-800 px-5 py-3 focus:outline-none focus:border-[#2df07b] focus:ring-1 focus:ring-[#2df07b] transition-colors"
                    type="email"
                    placeholder="name@arena.pro"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-semibold py-3.5 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : null}
                    {loading ? "Transmitting..." : "Transmit Link"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center flex flex-col items-center justify-center py-4">
              <div className="w-20 h-20 bg-[#2df07b]/10 border border-[#2df07b]/20 rounded-full flex items-center justify-center mb-8 text-[#2df07b]">
                <MailCheck size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-[32px] md:text-[40px] font-light text-slate-800 mb-4 leading-tight">
                Transmission <br/> Sent.
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-10">
                We've sent a recovery link to <span className="font-semibold text-slate-700">{email}</span>. Please check your secure intake.
              </p>
              <Link
                to="/login"
                className="w-full bg-black hover:bg-gray-900 text-[#2df07b] font-semibold py-3.5 px-6 rounded-full transition-colors flex items-center justify-center border border-black"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
