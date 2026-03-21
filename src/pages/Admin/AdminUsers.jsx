import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { User, ChevronRight, Search, ShieldCheck, GraduationCap, School } from 'lucide-react';

const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: 'bg-red-50 text-red-600 border-red-100',
    TEACHER: 'bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20',
    STUDENT: 'bg-blue-50 text-blue-600 border-blue-100',
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border inline-flex items-center gap-1.5 ${styles[role] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
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
    <div className="animate-fade-in space-y-10 pb-20">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Identity Hub</h1>
          <p className="text-gray-500 mt-1 text-[15px]">Manage user permissions, monitor registration logs, and enforce security protocols.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg font-black text-[10px] text-gray-400 uppercase tracking-widest">
           <User size={16} />
           {users.length} Identities Registered
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex gap-2 p-1 bg-gray-50 rounded-xl overflow-x-auto no-scrollbar">
          {['ALL', 'ADMIN', 'TEACHER', 'STUDENT'].map(role => (
            <button 
              key={role} 
              onClick={() => setFilter(role)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === role ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-white'}`}
            >
              {role}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:max-w-xs group">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
              <Search size={18} />
           </div>
           <input 
              className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 px-6 py-3.5 pl-12 focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Query Name or Email..."
           />
        </div>
      </div>

      {/* Results Identity Ledger */}
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-8 py-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">Descriptor</th>
                <th className="px-5 py-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">Credential Stream</th>
                <th className="px-5 py-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">Privilege Tier</th>
                <th className="px-8 py-5 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white font-black text-xs flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-900 font-black text-sm uppercase tracking-tight truncate max-w-[160px]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-gray-400 font-bold text-[13px]">{user.email}</td>
                  <td className="px-5 py-5"><RoleBadge role={user.role} /></td>
                  <td className="px-8 py-5 text-gray-400 text-[11px] font-bold uppercase tracking-widest text-right">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : 'Alpha Records'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Search size={32} className="text-gray-300" />
             </div>
             <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No matching identities found in records.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest pt-4">
         <span>Secure Ledger v4.2</span>
         <span>Identity Integrity Verified</span>
      </div>
    </div>
  );
}
