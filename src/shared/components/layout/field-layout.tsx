import { useMemo, useState, type ReactNode } from "react";
import { Outlet, useNavigate } from "react-router";
import { Menu as MenuIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Sheet } from "@/shared/components/ui/sheet";
import { NavList } from "@/shared/components/layout/nav-list";
import { FieldTabBar } from "@/shared/components/layout/field-tab-bar";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { SyncCounter } from "@/features/outbox/components/sync-counter";
import { useOutboxTriggers } from "@/features/outbox/hooks/use-outbox-triggers";
import { OfflineBanner } from "@/shared/components/feedback/offline-banner";
import { FIELD_NAV, navGroupsForRole } from "@/shared/constants/nav.constant";
import { ROLE_LABELS } from "@/shared/constants/roles.constant";

export interface FieldLayoutProps {
  readonly title?: string;
  readonly syncIndicator?: ReactNode;
}

export function FieldLayout({ title = "ARGUS", syncIndicator }: FieldLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const groups = useMemo(() => (role === null ? [] : navGroupsForRole(FIELD_NAV, role)), [role]);

  useOutboxTriggers();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-garis bg-kertas px-3">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{title}</span>
        {syncIndicator ?? <SyncCounter />}
        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setMenuOpen(true)}
          className="grid size-11 shrink-0 place-items-center rounded-kontrol text-ink transition-colors hover:bg-ink/5"
        >
          <MenuIcon aria-hidden strokeWidth={1.75} className="size-5" />
        </button>
      </header>
      <OfflineBanner />
      <main className="flex-1 px-4 py-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <FieldTabBar />
      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Menu"
        description="Catatan tetap aman di perangkat saat offline."
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-ink">{user?.nama ?? ""}</span>
              <span className="truncate text-xs text-ink-lemah">
                {role === null ? "" : ROLE_LABELS[role]}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        }
      >
        <NavList
          groups={groups}
          variant="field"
          ariaLabel="Menu aplikasi"
          onNavigate={() => setMenuOpen(false)}
        />
      </Sheet>
    </div>
  );
}