import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { User, ChevronRight, Search, ShieldCheck, GraduationCap, School } from 'lucide-react';

const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    TEACHER: 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20',
    STUDENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border inline-flex items-center gap-2 ${styles[role] || 'bg-white/5 text-gray-400 border-white/10'}`}>
       {role === 'ADMIN' && <ShieldCheck size={12} />}
       {role === 'TEACHER' && <School size={12} />}
       {role === 'STUDENT' && <GraduationCap size={12} />}
       {role}
    </span>
  );
};

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    adminService.getAllUsers().then(setUsers).catch(console.error);
  }, []);

  const filtered = users.filter(u => {
    const matchesRole = filter === 'ALL' || u.role === filter;
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="pb-20 relative z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2 text-[#2df07b]">
               <ShieldCheck size={14} />
               <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Collective Identity Management</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight uppercase font-outfit">Identity Hub</h1>
            <p className="text-gray-500 mt-2 text-[15px] font-medium max-w-xl italic">Manage user permissions, monitor registration logs, and enforce security protocols across the neural network.</p>
          </div>
          <div className="flex items-center gap-3 bg-black border border-white/10 px-6 py-3 rounded-full shadow-xl">
             <User size={16} className="text-gray-400" />
             <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-0.5 leading-none">{users.length} Identities Registered</span>
          </div>
        </div>

        {/* Control Bar: Filters & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-[#111111] border border-white/5 rounded-[32px] p-6 shadow-2xl">
          <div className="flex gap-3 p-1.5 bg-black/60 rounded-2xl overflow-x-auto no-scrollbar border border-white/5">
            {['ALL', 'ADMIN', 'TEACHER', 'STUDENT'].map(role => (
              <button 
                key={role} 
                onClick={() => setFilter(role)}
                className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === role ? 'bg-[#2df07b] text-black shadow-[0_0_20px_rgba(45,240,123,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                {role}
              </button>
            ))}
          </div>
          
          <div className="relative w-full lg:max-w-md group">
             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#2df07b] transition-colors">
                <Search size={18} />
             </div>
             <input 
                className="w-full bg-black/40 border border-white/10 rounded-2xl text-[13px] font-bold text-white px-6 py-4 pl-14 focus:outline-none focus:border-[#2df07b]/50 transition-all placeholder:text-gray-700" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="QUERY NAME OR EMAIL..."
             />
          </div>
        </div>

        {/* Results Identity Ledger */}
        <div className="bg-[#111111] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-10 py-6 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Descriptor</th>
                  <th className="px-6 py-6 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Credential Stream</th>
                  <th className="px-6 py-6 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-center">Privilege Tier</th>
                  <th className="px-10 py-6 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filtered.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.01] transition-all">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 text-white font-bold text-[15px] flex items-center justify-center shadow-inner group-hover:border-[#2df07b]/20 group-hover:text-[#2df07b] transition-all">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-bold text-[16px] uppercase tracking-tight group-hover:text-white transition-colors">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-7 text-gray-500 font-medium text-[14px] font-mono">{user.email}</td>
                    <td className="px-6 py-7 text-center"><RoleBadge role={user.role} /></td>
                    <td className="px-10 py-7 text-gray-600 text-[11px] font-bold uppercase tracking-widest text-right italic font-mono">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'ALPHA RECORD'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
               <div className="w-20 h-20 bg-black rounded-[32px] border border-white/5 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                  <Search size={32} className="text-gray-800" />
               </div>
               <p className="text-[11px] font-bold text-gray-700 uppercase tracking-[0.4em] italic animate-pulse">Scanning Archive... No matching identities found.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-gray-800 uppercase tracking-[0.3em] pt-8 border-t border-white/5">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
              <span>Secure Ledger v4.2.0</span>
           </div>
           <span className="animate-pulse">Identity Integrity Verified • Collective Active</span>
        </div>
      </div>
    </div>
  );
}
