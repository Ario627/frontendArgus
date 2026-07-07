import { type ReactNode } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import { LayoutDashboard, Truck, LifeBuoy } from "lucide-react";
import { useOnlineStatus } from "../../hooks/use-online-status";
import { HealthIndicator } from "./health-indicator";
import { cn } from "../../../lib/cn";

interface MobileNavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: typeof LayoutDashboard;
}

interface MobileShellProps {
  readonly children?: ReactNode;
}

const MOBILE_NAV: readonly MobileNavItem[] = Object.freeze([
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/fleet",     label: "Armada",    icon: Truck },
  { to: "/app/recovery",  label: "Recovery",  icon: LifeBuoy },
]);


export function MobileShell({ children }: MobileShellProps) {
  const location = useLocation();
  const isOnline = useOnlineStatus();

  return (
    <div className="flex h-screen flex-col bg-background">
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-destructive/10 px-4 py-1.5 text-xs text-destructive">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
          Offline
        </div>
      )}

      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-bold text-brand">ARGUS</span>
        <HealthIndicator />
      </header>

      <main className="flex-1 overflow-y-auto p-4" aria-busy={false}>
        {children ?? <Outlet />}
      </main>

      <nav className="flex h-14 shrink-0 items-center justify-around border-t border-border bg-background" aria-label="Navigasi mobile">
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive ? "text-brand" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}