import { Search, X } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../lib/cn";
import type { OperationalStatus } from "../../../shared/types/common.types";
import type { FleetFilters } from "../../../shared/types/fleet.types";

type StatusFilter = OperationalStatus | "all";

interface FleetFilterBarProps {
  filters: FleetFilters;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "ONLINE_NORMAL", label: "Normal" },
  { value: "ONLINE_BROKEN", label: "Rusak (Online)" },
  { value: "STALE", label: "Stale" },
  { value: "OFFLINE", label: "Offline" },
] as const;

export function FleetFilterBar({
  filters,
  onSearchChange,
  onStatusChange,
  onReset,
}: FleetFilterBarProps) {
  const hasActiveFilters = filters.search !== "" || filters.status !== "all";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3  border border-border bg-background p-3",
      )}
    >
      <div className="relative flex-1 min-w-50">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari plat nomor atau nama sopir..."
          className={cn(
            "h-10 w-full  border border-border bg-transparent pl-9 pr-3 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Cari armada"
        />
      </div>

      <div className="relative cursor-pointer">
        <select
          value={filters.status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className={cn(
            "h-10 appearance-none  border border-border bg-transparent pl-3 pr-8 text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Filter status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        >
          ▾
        </span>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}