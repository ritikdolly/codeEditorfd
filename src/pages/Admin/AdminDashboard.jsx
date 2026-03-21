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
    <div className="animate-fade-in space-y-10 pb-20">
      
      {/* Header section with simple hierarchy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">System Overview</h1>
          <p className="text-gray-500 mt-1 text-[15px]">Global platform analytics and administrative control center.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg shadow-xl shadow-black/5">
           <ShieldCheck size={16} className="text-[#2df07b]" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Admin Authority Active</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            {/* Background design element */}
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${card.color}`}>
              <card.icon size={80} strokeWidth={0.5} />
            </div>
            
            <div className="flex flex-col relative z-10">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{card.label}</span>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-gray-900 leading-none">{card.value}</p>
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                   <card.icon size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Data Hub Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
               <Activity size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">System Performance Monitor</h3>
            <p className="text-gray-400 text-sm font-medium max-w-sm mt-2 mb-8 uppercase tracking-wide">Infrastructure health and load metrics are currently stable.</p>
            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
               <div className="w-3/4 h-full bg-[#2df07b] rounded-full"></div>
            </div>
         </div>

         <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 flex flex-col justify-between">
            <div className="space-y-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Management Triggers</span>
               <h3 className="text-lg font-black text-gray-900 leading-tight">Identity & Permission Control</h3>
               <p className="text-gray-500 text-[13px] font-medium leading-relaxed">Adjust user protocols, verify faculty credentials, or modify security tiers.</p>
            </div>
            <button
               onClick={() => window.location.href = '/admin/users'}
               className="w-full bg-black hover:bg-zinc-800 text-white font-black py-4 rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-8"
            >
               Manage User Protocols <ChevronRight size={18} />
            </button>
         </div>
      </div>
    </div>
  );
}
