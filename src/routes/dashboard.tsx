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
} from "lucide-react";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const navItems = [
  { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/profile" as const, label: "Profile", icon: User },
  { to: "/dashboard/genealogy" as const, label: "Genealogy", icon: TreePine },
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-amber-100 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-amber-100">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-amber flex items-center justify-center shadow-amber">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Trading Bee</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {allItems.map((item, idx) => {
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
                      ? "gradient-amber text-white shadow-amber"
                      : "text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-amber-100">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-xl gradient-amber flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
              </div>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px] shrink-0">
                {user.role}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full border-amber-200 hover:bg-amber-50 hover:text-amber-700" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center h-16 px-4 lg:px-6 border-b border-amber-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {allItems.find((i) =>
              i.to === "/dashboard"
                ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
                : location.pathname.startsWith(i.to)
            )?.label || "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
