import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { BookOpen, ArrowRight, Code2, LogOut, Search, Zap, ShieldCheck, Globe, Loader2 } from 'lucide-react';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [testId, setTestId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const joinTest = async (e) => {
    e.preventDefault();
    if (!testId.trim()) return;
    setLoading(true);
    try {
      let parsedId = testId.trim();
      const uuidMatch = parsedId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (uuidMatch) {
         parsedId = uuidMatch[0];
      }

      await studentService.getTest(parsedId);
      toast.success("Test found. Redirecting to assessment.");
      navigate(`/student/test/${parsedId}`);
    } catch (err) {
      toast.error('Test not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-gray-100 selection:bg-[#2df07b] selection:text-black flex flex-col overflow-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-full max-w-4xl h-96 bg-[#2df07b]/5 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2df07b]/5 blur-[100px] rounded-full pointer-events-none opacity-30"></div>

      {/* Navigation */}
      <nav className="w-full bg-[#09090b] py-5 px-8 lg:px-12 flex justify-between items-center border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="bg-white p-1 rounded-sm">
             <Code2 size={20} className="text-black" strokeWidth={3} />
           </div>
           <span className="font-bold text-white text-xl tracking-tight uppercase">CodeArena</span>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col text-right hidden sm:flex">
             <p className="text-sm font-bold text-white leading-none tracking-tight">{user?.name}</p>
             <span className="text-[10px] font-bold text-[#2df07b] uppercase tracking-widest mt-1 opacity-80">Student Account</span>
           </div>
           <button 
             onClick={handleLogout}
             className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95 group"
           >
             <LogOut size={18} />
           </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-xl w-full">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 text-[#2df07b] mb-4">
                 <ShieldCheck size={16} />
                 <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Student Dashboard</span>
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tight mb-4">Join a Test</h1>
              <p className="text-gray-400 font-medium text-[16px] max-w-sm mx-auto">Enter your test ID to join the assessment.</p>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-10 w-full relative overflow-hidden group">
               {/* Visual Detail */}
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity">
                 <BookOpen size={200} className="rotate-12" />
               </div>
               
               <div className="relative z-10 flex flex-col items-center gap-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#2df07b]/10 text-[#2df07b] flex items-center justify-center relative border border-[#2df07b]/20">
                     <Zap size={28} fill="currentColor" stroke="none" />
                  </div>

                  <form onSubmit={joinTest} className="w-full space-y-6">
                    <div className="space-y-3">
                       <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-2">Test ID</label>
                       <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 transition-colors">
                             <Search size={20} />
                          </div>
                          <input 
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl text-white px-6 py-4 pl-14 focus:outline-none focus:border-[#2df07b] transition-all placeholder:text-gray-600 font-bold uppercase tracking-widest text-lg" 
                            value={testId} 
                            onChange={e => setTestId(e.target.value)}
                            placeholder="VEC-XXXX-XXXX" 
                            required 
                          />
                       </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-[13px] shadow-[#2df07b]/10"
                    >
                      {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>Join Test <ArrowRight size={20} /></>
                      )}
                    </button>
                  </form>
               </div>
            </div>
        </div>
      </main>

      <footer className="py-10 px-12 flex justify-between items-center text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em] relative z-10 border-t border-white/5">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2df07b] animate-pulse"></div>
            Node Active: 8081
         </div>
         <div>© 2026 CodeArena Terminal</div>
      </footer>
    </div>
  );
}

