import { useState, type MouseEvent } from "react";
import { useHealthCheck } from "../../hooks/use-health-check";
import { cn } from "../../../lib/cn";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type HealthState = "ok" | "degraded" | "down";

const HEALTH_CONFIG: Record<HealthState, { colorClass: string; label: string; icon: typeof CheckCircle2 }> = Object.freeze({
  ok:       { colorClass: "text-status-normal",  label: "Sistem normal",                   icon: CheckCircle2 },
  degraded: { colorClass: "text-status-stale",   label: "Sebagian layanan bermasalah",      icon: AlertTriangle },
  down:     { colorClass: "text-status-offline", label: "Tidak dapat terhubung ke server",  icon: XCircle },
});

export function HealthIndicator() {
    const {data, isError} = useHealthCheck();
    const [showDetail, setShowDetail] = useState(false);

    const state: HealthState = isError || data?.status === "down"
    ? "down"
    : data?.status === "degraded"
      ? "degraded"
      : "ok";

  const config = HEALTH_CONFIG[state];
  const Icon = config.icon;

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
        className="flex items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-muted"
        aria-label={config.label}
      >
        <Icon className={cn("h-4 w-4", config.colorClass)} />
        <span className="text-xs text-muted-foreground">{config.label}</span>
      </button>

      {showDetail && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDetail(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-background p-4 shadow-lg">
            <p className="mb-3 text-sm font-medium text-foreground">Status Sistem</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                <span className={dbOk ? "text-status-normal" : "text-status-offline"}>
                  {dbOk ? "✓ Terhubung" : "✗ Terputus"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">MQTT</span>
                <span className={mqttOk ? "text-status-normal" : "text-status-offline"}>
                  {mqttOk ? "✓ Terhubung" : "✗ Terputus"}
                </span>
              </div>
              {lastCheck !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Terakhir dicek</span>
                  <span className="text-muted-foreground">{lastCheck}s lalu</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}