import { Chip } from "@/shared/components/ui/chip";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/cn";
import { formatDuration, formatKgValue, formatMoment } from "@/shared/lib/format";
import type { ScalePendingDto } from "@/shared/types/scale.types";

export interface ScalePendingTableProps {
  readonly items: readonly ScalePendingDto[];
  readonly sppgNames: ReadonlyMap<string, string>;
  readonly onLink: (item: ScalePendingDto) => void;
  readonly canLink?: boolean;
}

export function ScalePendingTable({
  items,
  sppgNames,
  onLink,
  canLink = true
}: ScalePendingTableProps) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => {
        const sppgLabel = sppgNames.get(item.sppgId) ?? `SPPG ${item.sppgId.slice(0, 8)}`;
        const linkable = item.dipakaiBatchId === null && !item.kedaluwarsa;
        return (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis py-3 last:border-b-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-mono text-md tabular-nums text-ink">
                {formatKgValue(item.beratKg, "device")}
              </span>
              <span className="flex flex-wrap gap-x-3 text-xs text-ink-lemah">
                <span className="truncate">{sppgLabel}</span>
                <span>{formatMoment(item.occurredAt)}</span>
                <span className="font-mono">{formatDuration(item.ageSeconds * 1000)} lalu</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {item.dipakaiBatchId === null ? (
                <Chip
                  className={cn(
                    "h-7",
                    item.kedaluwarsa ? "border-bata/50 text-bata" : "border-daun/50 text-daun"
                  )}
                >
                  {item.kedaluwarsa ? "kedaluwarsa" : "tersedia"}
                </Chip>
              ) : (
                <Chip className="h-7">tertaut · {item.dipakaiBatchId.slice(0, 8)}</Chip>
              )}
              {linkable && canLink ? (
                <Button variant="secondary" size="sm" onClick={() => onLink(item)}>
                  Tautkan
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
