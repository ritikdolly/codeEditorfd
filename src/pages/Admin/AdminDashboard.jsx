import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Users, BookOpen, ClipboardList, Activity, ChevronRight, GraduationCap, ShieldCheck } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getDashboard().then(setStats).catch(console.error);
  }, []);

  const cards = [
    { label: 'Enrolled Students', value: stats?.totalStudents ?? '—', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Faculty Members', value: stats?.totalTeachers ?? '—', icon: BookOpen, color: 'text-[#2df07b]', bg: 'bg-green-50' },
    { label: 'Active Sessions', value: stats?.totalTests ?? '—', icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Output', value: stats?.totalSubmissions ?? '—', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="pb-20 relative z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2 text-[#2df07b]">
               <ShieldCheck size={14} />
               <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Security Protocol Active</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight uppercase font-outfit">System Overview</h1>
            <p className="text-gray-500 mt-2 text-[15px] font-medium max-w-xl italic">Global platform analytics and neural administrative control center.</p>
          </div>
          <div className="flex items-center gap-3 bg-black border border-[#2df07b]/20 text-[#2df07b] px-6 py-3 rounded-full shadow-[0_0_20px_rgba(45,240,123,0.05)]">
             <Activity size={16} className="animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Admin Authority Verified</span>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <div key={card.label} className="bg-[#111111] border border-white/5 rounded-[32px] p-8 transition-all hover:border-[#2df07b]/20 group relative overflow-hidden shadow-2xl">
              {/* Background gradient effect */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#2df07b]/5 rounded-full blur-3xl group-hover:bg-[#2df07b]/10 transition-all opacity-0 group-hover:opacity-100"></div>
              
              <div className="flex flex-col relative z-10">
                <div className="flex items-center justify-between mb-6">
                   <div className={`p-3 rounded-2xl bg-white/5 ${card.color} border border-white/5 group-hover:border-[#2df07b]/20 transition-all`}>
                      <card.icon size={22} />
                   </div>
                   <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none group-hover:text-gray-400 transition-colors">{card.label}</span>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-5xl font-bold text-white leading-none font-outfit tracking-tighter group-hover:scale-105 transition-transform origin-left">{card.value}</p>
                  <ChevronRight size={18} className="text-gray-800 group-hover:text-[#2df07b] transition-all transform group-hover:scale-125 translate-y-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Data Hub Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-[40px] shadow-2xl p-12 transition-all hover:border-white/10 group">
              <div className="flex items-start justify-between mb-12">
                 <div className="space-y-1">
                    <p className="text-[#2df07b] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Network Integrity</p>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight font-outfit">System Performance Monitor</h3>
                    <p className="text-gray-500 text-sm font-medium mt-2 max-w-sm italic">Infrastructure health and load metrics are currently within optimal operational flux.</p>
                 </div>
                 <div className="w-16 h-16 rounded-3xl bg-black border border-white/5 flex items-center justify-center text-[#2df07b] shadow-inner group-hover:scale-110 transition-transform">
                    <Activity size={32} />
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Allocation Strain</span>
                    <span className="text-[11px] font-bold text-white font-mono">75% Capacity</span>
                 </div>
                 <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                    <div className="w-3/4 h-full bg-gradient-to-r from-[#2df07b]/50 via-[#2df07b] to-[#2df07b] rounded-full shadow-[0_0_15px_#2df07b]"></div>
                 </div>
                 <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.5em] text-center pt-2 italic">Neural processing unit active • Signal sequence locked</p>
              </div>
           </div>

           <div className="bg-[#111111] border border-white/5 rounded-[40px] shadow-2xl p-12 flex flex-col justify-between transition-all hover:border-white/10 group">
              <div className="space-y-2">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 mb-8 border border-white/5 group-hover:text-[#2df07b] group-hover:border-[#2df07b]/20 transition-all">
                    <Users size={24} />
                 </div>
                 <h3 className="text-2xl font-bold text-white leading-tight uppercase tracking-tight font-outfit">Identity & Permission Control</h3>
                 <p className="text-gray-500 text-[14px] font-medium leading-relaxed italic mt-4">Adjust user protocols, verify faculty credentials, or modify security tiers within the collective.</p>
              </div>
              
              <button
                 onClick={() => navigate('/admin/users')}
                 className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-5 rounded-3xl transition-all shadow-[0_0_30px_rgba(45,240,123,0.2)] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px] mt-10"
              >
                 Manage Users <ChevronRight size={18} strokeWidth={3} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
