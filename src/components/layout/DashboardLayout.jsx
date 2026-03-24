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
    { label: "Question Library", icon: BookOpen, path: "/teacher/questions" },
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
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}
    >
      {/* Logo & Header */}
      <div
        className="px-6 py-6"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={closeSidebar}
          >
            <div className="bg-[#2df07b] p-1.5 rounded text-black transition-transform">
              <Code2 size={24} strokeWidth={2.5} />
            </div>
            <span
              className="font-bold text-lg tracking-tight uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              SYNTXARENA
            </span>
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div
          className="mt-8 flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-muted)",
              border: "1px solid var(--card-border)",
            }}
          >
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <p
              className="text-sm font-bold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {user?.name}
            </p>
            <span className="text-[10px] text-[#2df07b] font-bold uppercase tracking-widest mt-0.5">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all"
              style={
                active
                  ? {
                      background: "var(--sidebar-active-bg)",
                      color: "var(--sidebar-active-text)",
                      boxShadow: "0 4px 12px rgba(45,240,123,0.2)",
                    }
                  : { color: "var(--sidebar-text-muted)" }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--sidebar-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--sidebar-text-muted)";
                }
              }}
            >
              <link.icon
                size={18}
                style={{
                  color: active
                    ? "var(--sidebar-active-text)"
                    : "var(--icon-muted)",
                }}
                strokeWidth={2.5}
              />
              {link.label}
              {active && (
                <ChevronRight
                  size={16}
                  className="ml-auto"
                  style={{ color: "var(--sidebar-active-text)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 space-y-2"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--sidebar-hover)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          {theme === "dark" ? (
            <>
              <Sun size={18} strokeWidth={2.5} /> Light Mode
            </>
          ) : (
            <>
              <Moon size={18} strokeWidth={2.5} /> Dark Mode
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
    <div
      className="flex h-screen w-full font-sans selection:bg-[#2df07b] selection:text-black overflow-hidden relative"
      style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}
    >
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: "var(--bg-main)" }}>
        {/* Header */}
        <header
          className="flex items-center justify-between px-8 py-4 sticky top-0 z-30"
          style={{ background: "var(--header-bg)", borderBottom: "1px solid var(--header-border)" }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{ color: "var(--text-muted)" }}
            >
              <Menu size={24} />
            </button>
            <div
              className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded"
              style={{ color: "var(--text-muted)", background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}
            >
              <span className="text-[#2df07b] font-black mr-1">/</span>
              {location.pathname.split("/")[2] || "Dashboard"}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-bold leading-none" style={{ color: "var(--text-primary)" }}>{user?.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "var(--text-muted)" }}>{role}</span>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", color: "var(--text-muted)" }}
              >
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 overflow-y-auto relative z-10 p-4 lg:p-10 custom-scrollbar">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-full max-w-2xl h-96 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" style={{ background: "var(--glow-color)" }}></div>

          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
