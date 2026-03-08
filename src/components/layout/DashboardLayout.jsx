import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LogOut, Home, Users, BookOpen, MonitorPlay, BarChart2, PlusCircle, LayoutDashboard } from "lucide-react";
import { cn } from "../../utils/cn";

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const getNavLinks = () => {
    if (user?.role === "admin") {
      return [
        { label: "Overview", icon: LayoutDashboard, path: "/admin" },
        { label: "Users", icon: Users, path: "/admin/users" },
        { label: "Question Bank", icon: BookOpen, path: "/admin/questions" },
        { label: "Monitor Tests", icon: MonitorPlay, path: "/admin/monitor" },
        { label: "Analytics", icon: BarChart2, path: "/admin/analytics" },
      ];
    } else if (user?.role === "teacher") {
      return [
        { label: "Dashboard", icon: Home, path: "/teacher" },
        { label: "Questions", icon: BookOpen, path: "/teacher/questions" },
        { label: "Create Test", icon: PlusCircle, path: "/teacher/tests/create" },
        { label: "Results", icon: BarChart2, path: "/teacher/results" },
      ];
    }
    return [];
  };

  const links = getNavLinks();

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-500">
            <MonitorPlay size={24} />
            <span>CodeArena</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (location.pathname.startsWith(link.path) && link.path !== "/admin" && link.path !== "/teacher");
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="mb-2 px-2 text-sm font-medium text-gray-900 dark:text-gray-200">
            {user?.name || "User"}
            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
          <h1 className="text-lg font-semibold truncate capitalize">
            {location.pathname.split("/").pop() || user?.role + " Dashboard"}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
