import { NavLink } from "react-router";
import { cn } from "@/shared/lib/cn";
import type { NavGroup } from "@/shared/constants/nav.constant";

export type NavVariant = "console" | "field";

interface NavVariantStyles {
  readonly item: string;
  readonly idle: string;
  readonly active: string;
  readonly label: string;
}

const VARIANT_STYLES: Readonly<Record<NavVariant, NavVariantStyles>> = Object.freeze({
  console: {
    item: "flex h-10 items-center border-l-2 pl-3.5 pr-3 text-base transition-colors duration-150 ease-out pointer-coarse:h-11",
    idle: "border-transparent text-ink-lemah hover:text-ink",
    active: "border-biru-tinta font-medium text-ink",
    label: "px-3.5 pt-5 pb-1 text-xs text-ink-lemah"
  },
  field: {
    item: "flex h-12 items-center rounded-kontrol px-3 text-md transition-colors duration-150 ease-out",
    idle: "text-ink hover:bg-ink/5",
    active: "bg-ink/5 font-medium text-ink",
    label: "px-3 pt-4 pb-1 text-xs text-ink-lemah"
  }
});

export interface NavListProps {
  readonly groups: readonly NavGroup[];
  readonly variant: NavVariant;
  readonly ariaLabel?: string;
  readonly onNavigate?: () => void;
}

export function NavList({ groups, variant, ariaLabel = "Navigasi", onNavigate }: NavListProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <nav aria-label={ariaLabel} className="flex flex-col">
      {groups.map((group) => (
        <div key={group.label === "" ? "utama" : group.label}>
          {group.label === "" ? null : <p className={styles.label}>{group.label}</p>}
          <ul>
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => cn(styles.item, isActive ? styles.active : styles.idle)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}