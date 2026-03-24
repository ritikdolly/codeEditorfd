import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Code2, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null; // No navbar on login screen

  return (
    <nav className="bg-white border-b border-gray-100 py-3 px-6 lg:px-12 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-[#2df07b] p-1.5 rounded text-black flex items-center justify-center">
            <Code2 size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 uppercase">CodeArena</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-500">
               <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-none">{user.name}</span>
              <span className="text-[10px] font-bold text-[#2df07b] uppercase tracking-widest mt-0.5">
                {user.role}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
