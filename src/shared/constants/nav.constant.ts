import type { UserRole } from "@/shared/constants/roles.constant";

export interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly roles: readonly UserRole[];
}

export interface NavGroup {
  readonly label: string;
  readonly items: readonly NavItem[];
}

export const CONSOLE_NAV: readonly NavGroup[] = Object.freeze([
  {
    label: "",
    items: Object.freeze([
      { to: "/dashboard", label: "Ringkasan", roles: Object.freeze(["admin", "dlh_auditor", "sppg_staff"] as const) }
    ])
  },
  {
    label: "Operasional",
    items: Object.freeze([
      { to: "/batches", label: "Batch", roles: Object.freeze(["admin", "dlh_auditor", "sppg_staff"] as const) },
      { to: "/ledger", label: "Buku besar", roles: Object.freeze(["admin", "dlh_auditor"] as const) },
      { to: "/dispositions", label: "Antrean putusan", roles: Object.freeze(["admin", "dlh_auditor", "sppg_staff"] as const) },
      { to: "/menu", label: "Cermin menu", roles: Object.freeze(["admin", "dlh_auditor", "sppg_staff"] as const) },
      { to: "/tickets", label: "Tiket warga", roles: Object.freeze(["admin", "dlh_auditor", "sppg_staff"] as const) },
      { to: "/routes", label: "Rute limpahan", roles: Object.freeze(["admin", "dlh_auditor"] as const) },
      { to: "/fleet", label: "Armada", roles: Object.freeze(["admin", "dlh_auditor"] as const) }
    ])
  },
  {
    label: "Master & audit",
    items: Object.freeze([
      { to: "/facilities", label: "Fasilitas", roles: Object.freeze(["admin", "dlh_auditor"] as const) },
      { to: "/devices", label: "Perangkat", roles: Object.freeze(["admin", "dlh_auditor"] as const) },
      { to: "/parameters", label: "Parameter", roles: Object.freeze(["admin", "dlh_auditor"] as const) },
      { to: "/anomalies", label: "Anomali", roles: Object.freeze(["admin", "dlh_auditor"] as const) },
      { to: "/audit", label: "Jejak audit", roles: Object.freeze(["admin"] as const) },
      { to: "/export", label: "Ekspor", roles: Object.freeze(["admin", "dlh_auditor"] as const) }
    ])
  }
]);

export const FIELD_NAV: readonly NavGroup[] = Object.freeze([
  {
    label: "",
    items: Object.freeze([
      { to: "/catat", label: "Catat limbah", roles: Object.freeze(["sppg_staff"] as const) },
      { to: "/rute-hari-ini", label: "Rute hari ini", roles: Object.freeze(["driver"] as const) },
      { to: "/fasilitas-masuk", label: "Fasilitas masuk", roles: Object.freeze(["facility"] as const) },
      { to: "/antrean", label: "Antrean", roles: Object.freeze(["sppg_staff", "driver", "facility"] as const) }
    ])
  }
]);

export function navGroupsForRole(groups: readonly NavGroup[], role: UserRole): readonly NavGroup[] {
  const filtered: NavGroup[] = [];
  for (const group of groups) {
    const items = group.items.filter((item) => item.roles.includes(role));
    if (items.length > 0) filtered.push({ label: group.label, items });
  }
  return filtered;
}

export function homePathForRole(role: UserRole): string {
  if (role === "driver") return "/rute-hari-ini";
  if (role === "facility") return "/fasilitas-masuk";
  return "/dashboard";
}