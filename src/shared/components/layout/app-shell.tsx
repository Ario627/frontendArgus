import { type ReactNode } from "react";
import { useLocation, Link, useNavigate, Outlet } from "react-router-dom";
import { useOnlineStatus } from "../../hooks/use-online-status";
import { HealthIndicator } from "./health-indicator";
import { Icon } from "../ui/icon";
import { cn } from "../../../lib/cn";

interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: "dashboard" | "truck" | "map-pin" | "route" | "life-buoy";
  readonly roles: readonly string[];
}

const NAV_ITEMS: readonly NavItem[] = Object.freeze([
  {
    to: "/app/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    roles: ["admin", "supervisor", "driver"],
  },
  { to: "/app/fleet", label: "Armada", icon: "truck", roles: ["admin", "supervisor"] },
  {
    to: "/app/destination",
    label: "Destinasi",
    icon: "map-pin",
    roles: ["admin", "supervisor"],
  },
  {
    to: "/app/optimization",
    label: "Optimasi",
    icon: "route",
    roles: ["admin"],
  },
  {
    to: "/app/recovery",
    label: "Recovery",
    icon: "life-buoy",
    roles: ["admin", "supervisor", "driver"],
  },
]);

interface AppShellProps {
  readonly children?: ReactNode;
  readonly userRole?: string;
  readonly userName?: string;
  readonly onLogout?: () => void;
}

export function AppShell({
  userRole = "",
  userName = "",
  onLogout,
}: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const handleLogout = () => {
    onLogout?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">
          <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden />
          Anda sedang offline — data mungkin tidak terbaru
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
          <div className="flex h-16 items-center border-b border-border px-5">
            <div className="flex items-center gap-2.5">
              <div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  ARGUS
                </span>
              </div>
            </div>
          </div>

          <nav
            className="flex-1 space-y-1 px-3 py-4"
            aria-label="Navigasi utama"
          >
            {visibleItems.map(({ to, label, icon }) => {
              const isActive =
                location.pathname === to ||
                location.pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-brand/10 text-brand shadow-sm shadow-brand/5"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    name={icon}
                    size={18}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-brand"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <div className="mb-2 rounded-lg bg-muted/50 px-3 py-2">
              <p className="truncate text-xs font-medium text-foreground">
                {userName}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {userRole}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            >
              <Icon name="logout" size={18} />
              Keluar
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
                <Icon name="truck" size={14} />
              </div>
              <span className="text-sm font-bold text-foreground">ARGUS</span>
            </div>
            <div className="hidden lg:block" />
            <HealthIndicator />
          </header>

          <main
            className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8"
            aria-busy={false}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
