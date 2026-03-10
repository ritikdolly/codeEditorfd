import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Code2, LayoutDashboard, Users, BookOpen, PlusCircle,
  BarChart2, LogOut, ChevronRight, Menu, X
} from 'lucide-react';

const NAV = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'All Users', icon: Users, path: '/admin/users' },
  ],
  teacher: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
    { label: 'Create Question', icon: BookOpen, path: '/teacher/questions/create' },
    { label: 'Create Test', icon: PlusCircle, path: '/teacher/tests/create' },
    { label: 'Results', icon: BarChart2, path: '/teacher/results' },
  ],
};

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role?.toLowerCase();
  const links = NAV[role] || [];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600/20">
              <Code2 size={18} className="text-purple-400" />
            </div>
            <span className="font-bold text-white text-lg">CodeArena</span>
          </div>
          {/* Close button — only visible on mobile */}
          <button
            onClick={closeSidebar}
            className="hamburger-btn md-hide"
            style={{ display: 'flex' }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 px-1">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <span className="text-xs text-slate-400 capitalize font-medium">{role}</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(link => {
          const active = location.pathname === link.path ||
            (link.path !== '/admin' && link.path !== '/teacher' && location.pathname.startsWith(link.path));
          return (
            <Link key={link.path} to={link.path} onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-purple-600/25 text-white border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}>
              <link.icon size={16} className={active ? 'text-purple-400' : ''} />
              {link.label}
              {active && <ChevronRight size={14} className="ml-auto text-purple-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700/50">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-root">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="dashboard-main flex flex-col">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="topbar-logo">
            <div className="p-1.5 rounded-lg bg-purple-600/20">
              <Code2 size={16} className="text-purple-400" />
            </div>
            <span className="font-bold text-white">CodeArena</span>
          </div>
          <span className="text-xs text-slate-400 capitalize">{role}</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
