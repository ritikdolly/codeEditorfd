import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { Users, BookOpen, ClipboardList, Activity, ChevronRight, GraduationCap, ShieldCheck } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getDashboard().then(setStats).catch(console.error);
  }, []);

  const cards = [
    { label: 'Enrolled Students', value: stats?.totalStudents ?? '—', icon: GraduationCap, color: 'text-blue-600' },
    { label: 'Faculty Members', value: stats?.totalTeachers ?? '—', icon: BookOpen, color: 'text-[#2df07b]' },
    { label: 'Active Sessions', value: stats?.totalTests ?? '—', icon: ClipboardList, color: 'text-orange-500' },
    { label: 'Total Output', value: stats?.totalSubmissions ?? '—', icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div className="pb-20 relative z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10" style={{ borderBottom: "1px solid var(--divider)" }}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2 text-[#2df07b]">
               <ShieldCheck size={14} />
               <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Admin Panel</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight uppercase" style={{ color: "var(--text-primary)" }}>System Overview</h1>
            <p className="mt-2 text-[15px] font-medium max-w-xl" style={{ color: "var(--text-muted)" }}>
              Platform analytics and administrative control center.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
             <Activity size={16} className="text-[#2df07b] animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5" style={{ color: "var(--text-secondary)" }}>Admin Verified</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-[24px] p-8 transition-all group relative overflow-hidden"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--card-hover-border)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; }}
            >
              {/* Background glow */}
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all" style={{ background: "var(--glow-color)" }}></div>

              <div className="flex flex-col relative z-10">
                <div className="flex items-center justify-between mb-6">
                   <div className={`p-3 rounded-2xl ${card.color}`} style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
                      <card.icon size={22} />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest leading-none transition-colors" style={{ color: "var(--text-faint)" }}>{card.label}</span>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-5xl font-bold leading-none tracking-tighter group-hover:scale-105 transition-transform origin-left" style={{ color: "var(--text-primary)" }}>{card.value}</p>
                  <ChevronRight size={18} className="group-hover:text-[#2df07b] transition-all transform group-hover:scale-125 translate-y-1" style={{ color: "var(--icon-muted)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div
             className="lg:col-span-2 rounded-[32px] p-12 transition-all group"
             style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
             onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--card-hover-border)"; }}
             onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; }}
           >
              <div className="flex items-start justify-between mb-12">
                 <div className="space-y-1">
                    <p className="text-[#2df07b] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">System Health</p>
                    <h3 className="text-2xl font-bold uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>Performance Monitor</h3>
                    <p className="text-sm font-medium mt-2 max-w-sm" style={{ color: "var(--text-muted)" }}>
                      Infrastructure health metrics are within optimal range.
                    </p>
                 </div>
                 <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-[#2df07b] group-hover:scale-110 transition-transform" style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
                    <Activity size={32} />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Capacity</span>
                    <span className="text-[11px] font-bold font-mono" style={{ color: "var(--text-primary)" }}>75%</span>
                 </div>
                 <div className="w-full h-3 rounded-full overflow-hidden p-0.5" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--card-border)" }}>
                    <div className="w-3/4 h-full bg-gradient-to-r from-[#2df07b]/50 via-[#2df07b] to-[#2df07b] rounded-full shadow-[0_0_15px_#2df07b]"></div>
                 </div>
                 <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-center pt-2" style={{ color: "var(--text-faint)" }}>
                   System operational • All services active
                 </p>
              </div>
           </div>

           <div
             className="rounded-[32px] p-12 flex flex-col justify-between transition-all group"
             style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
             onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--card-hover-border)"; }}
             onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; }}
           >
              <div className="space-y-2">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8 group-hover:text-[#2df07b] transition-all"
                   style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", color: "var(--icon-muted)" }}>
                    <Users size={24} />
                 </div>
                 <h3 className="text-2xl font-bold leading-tight uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>User Management</h3>
                 <p className="text-[14px] font-medium leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>
                   View all users, manage roles, and monitor registration activity.
                 </p>
              </div>

              <button
                 onClick={() => navigate('/admin/users')}
                 className="w-full bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-5 rounded-2xl transition-all shadow-lg shadow-[#2df07b]/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px] mt-10"
              >
                 Manage Users <ChevronRight size={18} strokeWidth={3} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
