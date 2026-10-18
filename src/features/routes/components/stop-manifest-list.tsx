import { useState } from "react";
import { ConfirmDialog } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { stopActionsFor, isStopClosed } from "@/features/routes/route-labels";
import { ROUTE_STOP_KIND_LABELS, ROUTE_STOP_STATUS_LABELS } from "@/shared/constants/route.constant";
import { cn } from "@/shared/lib/cn";
import { formatTime } from "@/shared/lib/format";
import type { ConfirmableStopStatus } from "@/shared/constants/route.constant";
import type { RouteStopDto } from "@/shared/types/route.types";

const ACTION_LABELS: Readonly<Record<string, string>> = Object.freeze({
  SAMPAI: "Sampai",
  SELESAI: "Selesai",
  GAGAL: "Gagal"
});

const STATUS_TEXT_CLASSES: Readonly<Record<RouteStopDto["status"], string>> = Object.freeze({
  RENCANA: "text-ink-lemah",
  SAMPAI: "text-biru-tinta",
  SELESAI: "text-daun",
  GAGAL: "text-bata"
});

export interface StopManifestListProps {
  readonly stops: readonly RouteStopDto[];
  readonly facilityNames: ReadonlyMap<string, string>;
  readonly actionsEnabled: boolean;
  readonly busy: boolean;
  readonly onAction: (stop: RouteStopDto, status: ConfirmableStopStatus) => void;
}

export function StopManifestList({
  stops,
  facilityNames,
  actionsEnabled,
  busy,
  onAction
}: StopManifestListProps) {
  const [failTarget, setFailTarget] = useState<RouteStopDto | null>(null);
  const currentStopId = stops.find((stop) => !isStopClosed(stop.status))?.id ?? null;

  if (stops.length === 0) {
    return <p className="text-sm text-ink-lemah">Rute ini belum punya stop.</p>;
  }

  const destinationOf = (stop: RouteStopDto): string => {
    if (stop.jenis === "AMBIL") return "Dapur sumber";
    if (stop.fasilitasId === null) return "Tujuan belum ditentukan";
    return facilityNames.get(stop.fasilitasId) ?? `Fasilitas ${stop.fasilitasId.slice(0, 8)}`;
  };

  return (
    <ol className="flex flex-col">
      {stops.map((stop) => {
        const isCurrent = stop.id === currentStopId;
        const actions = actionsEnabled ? stopActionsFor(stop.status) : [];
        return (
          <li
            key={stop.id}
            className={cn(
              "flex flex-col gap-2 border-b border-garis py-3 last:border-b-0",
              isCurrent && "border-l-2 border-l-biru-tinta pl-3"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full font-mono text-xs",
                  isCurrent ? "bg-biru-tinta text-kertas" : "border border-garis text-ink-lemah"
                )}
              >
                {stop.urutan}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-base text-ink">{destinationOf(stop)}</p>
                <p className="flex flex-wrap gap-x-3 font-mono text-2xs text-ink-lemah">
                  <span>{ROUTE_STOP_KIND_LABELS[stop.jenis]}</span>
                  <span>batch {stop.batchId.slice(0, 8)}</span>
                  {stop.eta === null ? null : <span>ETA {formatTime(stop.eta)}</span>}
                  <span className={STATUS_TEXT_CLASSES[stop.status]}>
                    {ROUTE_STOP_STATUS_LABELS[stop.status]}
                  </span>
                </p>
              </div>
            </div>

            {actions.length === 0 ? null : (
              <div className="flex flex-wrap gap-2 pl-11">
                {actions.map((action) => (
                  <Button
                    key={action}
                    variant={action === "GAGAL" ? "danger" : action === "SAMPAI" ? "primary" : "secondary"}
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      if (action === "GAGAL") setFailTarget(stop);
                      else onAction(stop, action);
                    }}
                  >
                    {ACTION_LABELS[action]}
                  </Button>
                ))}
              </div>
            )}
          </li>
        );
      })}

      <ConfirmDialog
        open={failTarget !== null}
        onOpenChange={(open) => {
          if (!open) setFailTarget(null);
        }}
        title="Tandai stop gagal?"
        description="Stop ditutup sebagai gagal dan tidak bisa diubah lagi. Catat alasannya pada koordinasi lisan dengan admin."
        confirmLabel="Tandai gagal"
        tone="bahaya"
        onConfirm={() => {
          const target = failTarget;
          setFailTarget(null);
          if (target !== null) onAction(target, "GAGAL");
        }}
      />
    </ol>
  );
}