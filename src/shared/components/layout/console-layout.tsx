import { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Menu as MenuIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Sheet } from "@/shared/components/ui/sheet";
import { NavList } from "@/shared/components/layout/nav-list";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { CONSOLE_NAV, navGroupsForRole } from "@/shared/constants/nav.constant";
import { ROLE_LABELS } from "@/shared/constants/roles.constant";

export function ConsoleLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const groups = useMemo(() => (role === null ? [] : navGroupsForRole(CONSOLE_NAV, role)), [role]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const identity = (
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-sm text-ink">{user?.nama ?? ""}</span>
      <span className="truncate text-xs text-ink-lemah">
        {role === null ? "" : ROLE_LABELS[role]}
      </span>
    </div>
  );

  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden border-r border-garis md:sticky md:top-0 md:flex md:h-dvh md:w-56 md:shrink-0 md:flex-col md:overflow-y-auto">
        <div className="px-3.5 pt-4 pb-1">
          <p className="text-md font-semibold text-ink">ARGUS</p>
          <p className="text-xs text-ink-lemah">Konsol pengelolaan</p>
        </div>
        <NavList groups={groups} variant="console" ariaLabel="Navigasi konsol" />
        <div className="mt-auto border-t border-garis px-3.5 py-3">
          {identity}
          <Button variant="ghost" size="sm" fullWidth className="mt-2" onClick={handleLogout}>
            Keluar
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-garis bg-kertas px-2 md:hidden">
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setMenuOpen(true)}
            className="grid size-11 place-items-center rounded-kontrol text-ink transition-colors hover:bg-ink/5"
          >
            <MenuIcon aria-hidden strokeWidth={1.75} className="size-5" />
          </button>
          <span className="text-md font-semibold text-ink">ARGUS</span>
        </div>
        <main className="min-w-0 flex-1 px-4 py-4 md:px-8 md:py-7 xl:px-12">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Menu"
        description="Navigasi konsol pengelolaan."
        footer={
          <div className="flex items-center justify-between gap-3">
            {identity}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        }
      >
        <NavList
          groups={groups}
          variant="field"
          ariaLabel="Navigasi konsol"
          onNavigate={() => setMenuOpen(false)}
        />
      </Sheet>
    </div>
  );
}