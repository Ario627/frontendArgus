import { type ReactNode } from "react";
import { useLocation, Link, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Truck, MapPin, Route, LifeBuoy, LogOut } from "lucide-react";
import { useOnlineStatus } from "../../hooks/use-online-status";
import { HealthIndicator } from "./health-indicator";
import { cn } from "../../../lib/cn";

interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: typeof LayoutDashboard;
  readonly roles: readonly string[];
}

const NAV_ITEMS: readonly NavItem[] = Object.freeze([
  { to: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard, roles: ["admin", "supervisor", "driver"] },
  { to: "/fleet",       label: "Armada",       icon: Truck,           roles: ["admin", "supervisor"] },
  { to: "/destination", label: "Destinasi",    icon: MapPin,          roles: ["admin", "supervisor"] },
  { to: "/optimization",label: "Optimasi",     icon: Route,           roles: ["admin"] },
  { to: "/recovery",    label: "Recovery",     icon: LifeBuoy,        roles: ["admin", "supervisor", "driver"] },
]);

interface AppShellProps {
  readonly children?: ReactNode;
  readonly userRole?: string;
  readonly userName?: string;
  readonly onLogout?: () => void;
}


export function AppShell({userRole = "", userName = "", onLogout}: AppShellProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const isOnline = useOnlineStatus();

    const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

    const handleLogout = () => {
        onLogout?.();
        navigate("/login", {replace: true});
    }

    return (
        <div className="flex h-screen flex-col bg-background">
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <span className="h-2 w-2 rounded-full bg-destructive" />
          Anda sedang offline — data mungkin tidak terbaru
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-border bg-muted/30 lg:flex">
          <div className="flex h-14 items-center px-6">
            <span className="text-lg font-bold text-brand">ARGUS</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigasi utama">
            {visibleItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <div className="mb-2 px-3 py-2 text-xs text-muted-foreground">
              {userName} <span className="text-muted-foreground/60">({userRole})</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border px-6">
            <h1 className="text-sm font-semibold text-foreground lg:hidden">ARGUS</h1>
            <div className="hidden lg:block" />
            <HealthIndicator />
          </header>

          <main className="flex-1 overflow-y-auto p-6" aria-busy={false}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
    )
}