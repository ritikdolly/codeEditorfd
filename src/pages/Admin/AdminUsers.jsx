import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { User, Crown, GraduationCap } from 'lucide-react';

const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: 'badge-red',
    TEACHER: 'badge-purple',
    STUDENT: 'badge-blue',
  };
  return <span className={`badge ${styles[role] || 'badge-blue'}`}>{role}</span>;
};

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    adminService.getAllUsers().then(setUsers).catch(console.error);
  }, []);

  const filtered = filter === 'ALL' ? users : users.filter(u => u.role === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">{users.length} total users</p>
        </div>
        <div className="flex gap-2 role-filter-wrap">
          {['ALL', 'ADMIN', 'TEACHER', 'STUDENT'].map(role => (
            <button key={role} onClick={() => setFilter(role)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === role ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}>
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="table-responsive">
          <table className="w-full" style={{ minWidth: 560 }}>
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">User</th>
                <th className="text-left p-4 text-slate-400 font-medium">Email</th>
                <th className="text-left p-4 text-slate-400 font-medium">Role</th>
                <th className="text-left p-4 text-slate-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 font-bold text-sm flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium whitespace-nowrap">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 whitespace-nowrap">{user.email}</td>
                  <td className="p-4"><RoleBadge role={user.role} /></td>
                  <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">No users found</div>
        )}
      </div>
    </div>
  );
}
