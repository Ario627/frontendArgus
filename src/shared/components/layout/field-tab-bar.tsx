import { Link, useLocation } from "react-router";
import { cn } from "@/shared/lib/cn";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { UserRole } from "@/shared/constants/roles.constant";

interface TabItem {
  readonly to: string;
  readonly label: string;
  readonly roles: readonly UserRole[];
}

const TABS: readonly TabItem[] = Object.freeze([
  { to: "/catat", label: "Catat", roles: ["sppg_staff"] as const },
  { to: "/batch-hari-ini", label: "Batch", roles: ["sppg_staff"] as const },
  { to: "/timbangan", label: "Timbangan", roles: ["sppg_staff"] as const },
  { to: "/rute-hari-ini", label: "Rute", roles: ["driver"] as const },
  { to: "/fasilitas-masuk", label: "Masuk", roles: ["facility"] as const },
  {
    to: "/antrean",
    label: "Antrean",
    roles: ["sppg_staff", "driver", "facility"] as const
  }
]);

export function FieldTabBar() {
  const role = useAuthStore((state) => state.role);
  const location = useLocation();
  if (role === null) return null;

  const items = TABS.filter((tab) => tab.roles.includes(role));
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-garis bg-kertas pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex">
        {items.map((tab) => {
          const active =
            location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-13 flex-col items-center justify-center border-t-2 text-xs transition-colors",
                  active
                    ? "border-t-biru-tinta font-medium text-ink"
                    : "border-t-transparent text-ink-lemah"
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
