import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { ShieldCheck, Clock, User, Zap, Lock } from 'lucide-react';

export default function JoinTest() {
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareLink) return;
    api.get(`/student/tests/${shareLink}`)
       .then(res => setTestDetails(res.data))
       .catch(err => {
           toast.error("Invalid test link or unauthorized access.");
           navigate('/');
       })
       .finally(() => setLoading(false));
  }, [shareLink, navigate]);

  const handleStartExam = () => {
      navigate(`/student/test/${testDetails.id}`);
  };

  return (
    <div className="min-h-screen bg-[#09090b] relative overflow-hidden selection:bg-[#2df07b] selection:text-black">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2df07b]/5 rounded-full blur-[140px] pointer-events-none"></div>
      
      <Navbar />
      
      <div className="flex flex-col items-center justify-center pt-32 px-4 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 rounded-2xl border-2 border-[#2df07b]/20 border-t-[#2df07b] animate-spin"></div>
             <div className="text-gray-500 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">Loading Test...</div>
          </div>
        ) : testDetails ? (
          <div className="bg-[#111111] p-12 max-w-xl w-full shadow-2xl rounded-[48px] text-center border border-white/10 relative overflow-hidden group">
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 p-8 opacity-5 text-white group-hover:opacity-10 transition-opacity">
               <ShieldCheck size={160} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
               <div className="w-16 h-16 rounded-2xl bg-[#2df07b]/10 flex items-center justify-center text-[#2df07b] mb-8 border border-[#2df07b]/20 shadow-xl">
                  <Lock size={28} strokeWidth={2.5} />
               </div>

               <h1 className="text-4xl font-bold text-white mb-3 uppercase tracking-tight font-outfit">
                 {testDetails.name}
               </h1>
               <p className="text-[#2df07b] text-[10px] font-bold uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#2df07b] animate-pulse"></span>
                 Authorized Test Session
               </p>

               <div className="bg-black/40 rounded-[32px] p-8 mb-12 text-left border border-white/5 w-full space-y-8 shadow-inner">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/5">
                          <Clock size={18} />
                       </div>
                       <div>
                          <span className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Test Duration</span>
                          <span className="text-[17px] font-bold text-white">{testDetails.duration} Minutes</span>
                       </div>
                    </div>
                    <div>
                       <span className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${testDetails.status === "ACTIVE" ? "bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/30" : "bg-white/5 text-amber-500 border-white/10"}`}>
                         {testDetails.status}
                       </span>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/5">
                       <User size={18} />
                    </div>
                    <div>
                       <span className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Student Details</span>
                       <span className="text-[15px] font-bold text-white tracking-tight">{user?.name} <span className="text-gray-600 font-medium ml-2">{user?.email}</span></span>
                    </div>
                 </div>
               </div>

               <button
                 disabled={testDetails.status !== "ACTIVE"}
                 onClick={handleStartExam}
                 className="w-full py-5 px-8 bg-[#2df07b] hover:bg-[#25c464] text-black rounded-2xl font-bold text-sm shadow-xl shadow-[#2df07b]/10 transition-all uppercase tracking-widest active:scale-95 disabled:bg-white/5 disabled:text-gray-600 disabled:border-white/5 disabled:cursor-not-allowed flex items-center justify-center gap-3"
               >
                 {testDetails.status === "ACTIVE" ? (
                   <>Start Test <Zap size={18} fill="currentColor" /></>
                 ) : (
                   <>Waiting for test to start...</>
                 )}
               </button>
               
               {testDetails.status !== "ACTIVE" && (
                 <p className="text-[10px] text-gray-700 mt-6 font-bold uppercase tracking-widest animate-pulse">
                   Waiting for the teacher to start the test.
                 </p>
               )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

