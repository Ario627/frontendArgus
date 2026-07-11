import { memo } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  InfoIcon,
  LifeBuoyIcon,
  XCircleIcon,
} from "lucide-react";
import { cn } from "../../../lib/cn";
import { Button } from "../../../shared/components/ui/button";
import type { RecoveryResult } from "../../../shared/types/recovery.types";

interface RecoveryResultCardProps {
  result: RecoveryResult;
  onAssignManual?: () => void;
  className?: string;
}

const STATUS_CONFIG = Object.freeze({
  success: {
    icon: CheckCircle2Icon,
    colorClass: "text-status-normal",
    bgClass: "bg-status-normal/10 border-status-normal/30",
    label: "Recovery Berhasil",
  },
  no_receiver: {
    icon: XCircleIcon,
    colorClass: "text-status-offline",
    bgClass: "bg-status-offline/10 border-status-offline/30",
    label: "Tidak Ada Penerima",
  },
  fallback_greedy: {
    icon: AlertTriangleIcon,
    colorClass: "text-status-fallback",
    bgClass: "bg-status-fallback/10 border-status-fallback/30",
    label: "Mode Cadangan",
  },
} as const);

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)} detik`;
}

function RecoveryResultCardInner({
  result,
  onAssignManual,
  className,
}: RecoveryResultCardProps) {
  const config = STATUS_CONFIG[result.status];
  const StatusIcon = config.icon;
  const showFallbackBadge = result.fallback || result.status === "fallback_greedy";
  const showNoReceiverCTA = result.status === "no_receiver";

  return (
    <div
      className={cn(
        " border p-5 space-y-4",
        config.bgClass,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center border",
              config.bgClass,
            )}
          >
            <StatusIcon className={cn("h-5 w-5", config.colorClass)} aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {config.label}
            </h3>
            <p className="text-xs text-muted-foreground">
              Truk rusak: {result.brokenFleetId}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="h-3.5 w-3.5" />
          {formatDuration(result.durationMs)}
        </span>
      </div>

      {showFallbackBadge && (
        <div className="flex items-center gap-2  bg-status-fallback/10 px-3 py-2 text-xs text-status-fallback">
          <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0" />
          <span>
            Mode cadangan — rute belum optimal (redistribusi via greedy fallback,
            bukan OR-Tools).
          </span>
        </div>
      )}

      {showNoReceiverCTA && (
        <div className="space-y-3  bg-status-offline/10 px-3 py-3">
          <div className="flex items-start gap-2 text-xs text-status-offline">
            <InfoIcon className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Tidak ada armada penerima yang cocok dengan kapasitas cukup.
              Assign manual diperlukan untuk mendistribusikan stop truk rusak.
            </p>
          </div>
          {onAssignManual && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAssignManual}
              className="w-full"
            >
              <LifeBuoyIcon className="h-4 w-4" />
              Assign Manual
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className=" border border-border bg-background p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Armada Penerima
          </p>
          {result.receivingFleetIds.length > 0 ? (
            <ul className="space-y-1">
              {result.receivingFleetIds.map((id) => (
                <li key={id} className="text-xs text-foreground">
                  {id}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Tidak ada penerima terpilih
            </p>
          )}
        </div>

        <div className=" border border-border bg-background p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Stop Didistribusi Ulang
          </p>
          {result.redistributedStopIds.length > 0 ? (
            <ul className="space-y-1">
              {result.redistributedStopIds.map((id) => (
                <li key={id} className="text-xs text-foreground">
                  {id}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Tidak ada stop didistribusi
            </p>
          )}
        </div>
      </div>

      {result.llmNarrative !== null ? (
        <div className=" border border-border bg-background p-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Ringkasan Naratif
          </p>
          <p className="text-xs leading-relaxed text-foreground">
            {result.llmNarrative}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2  bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <InfoIcon className="h-3.5 w-3.5 shrink-0" />
          Ringkasan naratif tidak tersedia saat ini
        </div>
      )}
    </div>
  );
}

export const RecoveryResultCard = memo(RecoveryResultCardInner);
