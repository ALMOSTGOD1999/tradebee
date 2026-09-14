import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  LayoutDashboard,
  Users,
  TreePine,
  Wallet,
  Link2,
  LogOut,
  Menu,
  X,
  Shield,
  User,
  Hexagon,
  UserPlus,
  Layers,
} from "lucide-react";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const navItems = [
  { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/profile" as const, label: "Profile", icon: User },
  { to: "/dashboard/add-user" as const, label: "Add User", icon: UserPlus },
  { to: "/dashboard/genealogy" as const, label: "Genealogy", icon: TreePine },
  { to: "/dashboard/levels" as const, label: "Levels", icon: Layers },
  { to: "/dashboard/investment" as const, label: "Investment", icon: Wallet },
  { to: "/dashboard/referrals" as const, label: "Referrals", icon: Link2 },
  { to: "/dashboard/team" as const, label: "My Team", icon: Users },
];

const adminNavItems = [
  { to: "/dashboard/admin/create-user" as const, label: "Create User", icon: Shield },
  { to: "/dashboard/admin/all-users" as const, label: "All Users", icon: Users },
];

function DashboardLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/", search: { ref: undefined, login: undefined } });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return null;

  const allItems = user.role === "admin" ? [...navItems, ...adminNavItems] : navItems;
  const currentPage = allItems.find((i) =>
    i.to === "/dashboard"
      ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
      : location.pathname.startsWith(i.to)
  );

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#1c1917]" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-3 h-20 px-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl gradient-amber flex items-center justify-center shadow-lg shadow-amber-500/30 animate-glow-pulse">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Trade Bee</span>
              <p className="text-[10px] text-amber-400/70 font-medium tracking-widest uppercase">Investment Platform</p>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden ml-auto text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <p className="text-[10px] font-semibold text-amber-500/50 tracking-widest uppercase px-3 mb-3">Navigation</p>
            {allItems.map((item) => {
              const isActive = item.to === "/dashboard"
                ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "gradient-amber text-white shadow-lg shadow-amber-500/25 animate-fade-in-left"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-amber-500/60")} />
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-amber-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-amber-400/60 font-mono">{user.id}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0 border-amber-500/30 text-amber-400 bg-amber-500/10">
                {user.role}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-white/40 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center h-16 px-4 lg:px-8 bg-[#1e293b]/80 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden mr-3 text-stone-500" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">
              {currentPage?.label || "Dashboard"}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-700/50 text-slate-300 text-sm">
              <span className="text-xs font-medium">{user.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
