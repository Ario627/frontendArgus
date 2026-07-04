import { cn } from "../../../lib/cn";
import { OPERATIONAL_STATUS_CONFIG, HARDWARE_STATUS_CONFIG } from "../../constants/status.constant";
import type { OperationalStatus, HardwareStatus } from "../../types/common.types";

interface StatusBadgeBaseProps {
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
}

interface OperationalStatusBadgeProps extends StatusBadgeBaseProps {
  status: OperationalStatus;
  type?: "operational";
}

interface HardwareStatusBadgeProps extends StatusBadgeBaseProps {
  status: HardwareStatus;
  type: "hardware";
}

type StatusBadgeProps = OperationalStatusBadgeProps | HardwareStatusBadgeProps;

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

const dotSizeClasses = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
};

export function StatusBadge(props: StatusBadgeProps) {
  const { className, showDot = true, size = "md" } = props;

  const config =
    props.type === "hardware"
      ? HARDWARE_STATUS_CONFIG[props.status]
      : OPERATIONAL_STATUS_CONFIG[props.status as OperationalStatus];

  const label = config.label;
  const dotColorClass = config.colorClass;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        "bg-muted text-foreground",
        sizeClasses[size],
        className,
      )}
    >
      {showDot && (
        <span
          className={cn("rounded-full", dotSizeClasses[size], dotColorClass)}
          aria-hidden
        />
      )}
      <span>{label}</span>
    </span>
  );
}

interface RealtimeIndicatorProps {
  isRealTime: boolean;
  stalenessSeconds?: number;
  className?: string;
}

export function RealtimeIndicator({
  isRealTime,
  stalenessSeconds,
  className,
}: RealtimeIndicatorProps) {
  if (isRealTime) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-status-normal",
          className,
        )}
      >
        <span className="h-2 w-2 rounded-full bg-status-normal" aria-hidden />
        <span>Real-time</span>
      </span>
    );
  }

  const stalenessLabel =
    stalenessSeconds != null
      ? stalenessSeconds < 60
        ? `${stalenessSeconds}dtk lalu`
        : `${Math.floor(stalenessSeconds / 60)}mnt lalu`
      : "Tidak diketahui";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-status-stale",
        className,
      )}
      title={`Data terakhir: ${stalenessLabel}`}
    >
      <span className="h-2 w-2 rounded-full bg-status-stale" aria-hidden />
      <span>{stalenessLabel}</span>
    </span>
  );
}

interface FallbackBadgeProps {
  className?: string;
}

export function FallbackBadge({ className }: FallbackBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-status-fallback/10 px-2.5 py-1 text-sm font-medium text-status-fallback",
        className,
      )}
      title="Mode cadangan (rute belum optimal)"
    >
      Mode Cadangan
    </span>
  );
}