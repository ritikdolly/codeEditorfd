import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  Code2,
  LayoutDashboard,
  Users,
  BookOpen,
  PlusCircle,
  BarChart2,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

const NAV = {
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "All Users", icon: Users, path: "/admin/users" },
  ],
  teacher: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/teacher" },
    {
      label: "Question Library",
      icon: BookOpen,
      path: "/teacher/questions",
    },
    { label: "Create Test", icon: PlusCircle, path: "/teacher/tests/create" },
    { label: "Results", icon: BarChart2, path: "/teacher/results" },
  ],
};

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role?.toLowerCase();
  const links = NAV[role] || [];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#09090b] text-white">
      {/* ─── Logo & Header ─── */}
      <div className="px-6 py-6 border-b border-white/5 bg-[#09090b]">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={closeSidebar}
          >
            <div className="bg-[#2df07b] p-1.5 rounded text-black transition-transform">
              <Code2 size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-lg tracking-tight uppercase">
              CODEARENA
            </span>
          </Link>

          {/* Close button — only visible on mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden text-gray-500 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info Overlay */}
        <div className="mt-8 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 border border-white/10 font-bold uppercase">
             {user?.name?.charAt(0)}
           </div>
           <div className="flex flex-col min-w-0">
             <p className="text-white text-sm font-bold truncate">
               {user?.name}
             </p>
             <span className="text-[10px] text-[#2df07b] font-bold uppercase tracking-widest mt-0.5">
               {role}
             </span>
           </div>
        </div>
      </div>

      {/* ─── Nav Links ─── */}
      <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const active =
            location.pathname === link.path ||
            (link.path !== "/admin" &&
              link.path !== "/teacher" &&
              location.pathname.startsWith(link.path));

          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                active
                  ? "bg-[#2df07b] text-zinc-950 shadow-lg shadow-[#2df07b]/20"
                  : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <link.icon
                size={18}
                className={active ? "text-zinc-950" : "text-gray-500"}
                strokeWidth={2.5}
              />
              {link.label}
              {active && (
                <ChevronRight size={16} className="ml-auto text-zinc-950" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ─── Footer Section ─── */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-[#09090b]">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {theme === "dark" ? (
            <>
              <Sun size={18} strokeWidth={2.5} />
              Light Presence
            </>
          ) : (
            <>
              <Moon size={18} strokeWidth={2.5} />
              Dark Presence
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut size={18} strokeWidth={2.5} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#09090b] font-sans text-gray-100 selection:bg-[#2df07b] selection:text-black overflow-hidden relative">
      {/* ─── Mobile Sidebar Overlay ─── */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ─── Primary Sidebar ─── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#09090b] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ─── Hub Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#09090b]">
        {/* Hub Header Hub (Desktop Header + Mobile Header) */}
        <header className="flex items-center justify-between px-8 py-4 bg-[#09090b] border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-bold uppercase tracking-widest px-3 py-1.5 bg-white/5 rounded border border-white/5">
               <span className="text-[#2df07b] font-black mr-1">/</span>
               {location.pathname.split("/")[2] || "Dashboard"}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="flex flex-col text-right hidden sm:flex">
                 <span className="text-sm font-bold text-white leading-none">{user?.name}</span>
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{role} Terminal</span>
               </div>
               <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center font-bold text-gray-400">
                 {user?.name?.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        {/* ─── Page Outlet Hub ─── */}
        <main className="flex-1 overflow-y-auto relative z-10 p-4 lg:p-10 custom-scrollbar">
          {/* Subtle Background Glow for Context */}
          <div className="absolute top-0 right-0 w-full max-w-2xl h-96 bg-[#2df07b]/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50"></div>
          
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

