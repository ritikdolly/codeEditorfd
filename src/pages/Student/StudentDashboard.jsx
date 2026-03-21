import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { BookOpen, ArrowRight, Code2, LogOut, Search } from 'lucide-react';

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
      // Extract UUID if user pastes a full URL
      let parsedId = testId.trim();
      const uuidMatch = parsedId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (uuidMatch) {
         parsedId = uuidMatch[0];
      }

      await studentService.getTest(parsedId);
      navigate(`/student/test/${parsedId}`);
    } catch (err) {
      toast.error('Test not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans selection:bg-[#2df07b] selection:text-black flex flex-col items-center">
      
      {/* Mini-Header for students */}
      <nav className="w-full bg-white border-b border-gray-100 py-4 px-6 lg:px-12 flex justify-between items-center shadow-sm relative z-50">
        <div className="flex items-center gap-2">
           <div className="bg-[#2df07b] p-1.5 rounded text-black transition-transform">
             <Code2 size={24} strokeWidth={2.5} />
           </div>
           <span className="font-bold text-gray-900 text-lg tracking-tight uppercase">CodeArena</span>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col text-right hidden sm:flex">
             <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
             <span className="text-[10px] font-bold text-[#2df07b] uppercase tracking-widest mt-0.5">Student Account</span>
           </div>
           <button 
             onClick={handleLogout}
             className="p-2 border border-gray-100 bg-white rounded-lg text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm active:scale-95"
           >
             <LogOut size={20} />
           </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg animate-fade-in -mt-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Entrance Hub</h1>
          <p className="text-gray-400 mt-2 font-bold text-sm uppercase tracking-widest">Digital Examination Center</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 w-full relative overflow-hidden group">
           {/* Visual background element */}
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none translate-x-8 -translate-y-8">
             <BookOpen size={200} />
           </div>
           
           <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-[#2df07b] text-black flex items-center justify-center shadow-lg shadow-[#2df07b]/20">
                 <BookOpen size={30} strokeWidth={2.5} />
              </div>

              <div className="text-center">
                 <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Access Assessment</h2>
                 <p className="text-gray-400 text-xs font-bold leading-relaxed max-w-[240px] mt-2 uppercase tracking-wide">
                    Input the assessment token provided by your instructor.
                 </p>
              </div>

              <form onSubmit={joinTest} className="w-full space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                     <Search size={22} />
                  </div>
                  <input 
                    className="w-full bg-gray-50 border-none rounded-2xl text-gray-900 px-6 py-4 pl-12 focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300 font-bold" 
                    value={testId} 
                    onChange={e => setTestId(e.target.value)}
                    placeholder="Enter Assessment Code..." 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-black hover:bg-zinc-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  {loading ? 'Validating Token...' : <>Initialize Test <ArrowRight size={20} /></>}
                </button>
              </form>
              
              <div className="pt-4 border-t border-gray-50 w-full text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                   Privacy Protected • CodeArena Hub Protocol
                 </p>
              </div>
           </div>
        </div>
      </main>

      <footer className="py-10 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
         Terminal Ready • Session ID: {user?.id?.slice(0, 8)}
      </footer>
    </div>
  );
}
