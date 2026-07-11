import { useState, type MouseEvent } from "react";
import { useHealthCheck } from "../../hooks/use-health-check";
import { cn } from "../../../lib/cn";
import { Icon } from "../ui/icon";

type HealthState = "ok" | "degraded" | "down";

const HEALTH_CONFIG: Record<
  HealthState,
  { colorClass: string; label: string; icon: "dashboard" | "warning" | "close" }
> = Object.freeze({
  ok: { colorClass: "text-status-normal", label: "Sistem normal", icon: "dashboard" },
  degraded: {
    colorClass: "text-status-stale",
    label: "Sebagian layanan bermasalah",
    icon: "warning",
  },
  down: {
    colorClass: "text-status-offline",
    label: "Tidak dapat terhubung ke server",
    icon: "close",
  },
});

export function HealthIndicator() {
  const { data, isError } = useHealthCheck();
  const [showDetail, setShowDetail] = useState(false);

  const state: HealthState =
    isError || data?.status === "down"
      ? "down"
      : data?.status === "degraded"
        ? "degraded"
        : "ok";

  const config = HEALTH_CONFIG[state];

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setShowDetail((prev) => !prev);
  };

  const dbOk = data?.db ?? false;
  const mqttOk = data?.mqtt ?? false;
  const lastCheck = data?.timestamp
    ? Math.floor((Date.now() - Date.parse(data.timestamp)) / 1000)
    : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 border border-border bg-card px-2.5 py-1.5 transition-colors hover:border-foreground cursor-pointer"
        aria-label={config.label}
      >
        <Icon
          name={config.icon}
          size={14}
          className={cn(config.colorClass)}
        />
        <span className="font-mono-readout text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {config.label}
        </span>
      </button>

      {showDetail && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetail(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-64 border border-border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">
              Status Sistem
            </p>
            <div className="space-y-2 font-mono-readout text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                <StatusValue ok={dbOk} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">MQTT</span>
                <StatusValue ok={mqttOk} />
              </div>
              {lastCheck !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Terakhir dicek</span>
                  <span className="text-muted-foreground">
                    {lastCheck}s lalu
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatusValue({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 font-medium uppercase tracking-wide",
        ok ? "text-status-normal" : "text-status-offline",
      )}
    >
      <Icon name={ok ? "dashboard" : "close"} size={12} />
      {ok ? "Online" : "Offline"}
    </span>
  );
}