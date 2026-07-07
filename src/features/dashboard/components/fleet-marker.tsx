import { memo, useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useLiveStaleness } from "../../../shared/hooks/use-live-staleness";
import {
  OPERATIONAL_STATUS_CONFIG,
  HARDWARE_STATUS_CONFIG,
} from "../../../shared/constants/status.constant";
import type { FleetPosition } from "../../../shared/types/fleet.types";
import type { OperationalStatus } from "../../../shared/types/common.types";

interface FleetMarkerProps {
  position: FleetPosition;
}

const STATUS_SVG_ICONS: Readonly<Record<OperationalStatus, string>> = {
  ONLINE_NORMAL: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="7" fill="hsl(var(--status-normal))" stroke="white" stroke-width="2.5"/><circle cx="13" cy="13" r="3" fill="white"/></svg>`,
  ONLINE_BROKEN: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="7" fill="hsl(var(--status-broken))" stroke="white" stroke-width="2.5"/><path d="M10 10 L16 16 M16 10 L10 16" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  STALE: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="7" fill="hsl(var(--status-stale))" stroke="white" stroke-width="2.5"/><circle cx="13" cy="13" r="2" fill="white"/></svg>`,
  OFFLINE: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="7" fill="hsl(var(--status-offline))" stroke="white" stroke-width="2.5"/><path d="M9 13 L17 13" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
};

const iconCache = new Map<OperationalStatus, L.DivIcon>();

function getMarkerIcon(operationalStatus: OperationalStatus): L.DivIcon {
  let icon = iconCache.get(operationalStatus);
  if (!icon) {
    const svg = STATUS_SVG_ICONS[operationalStatus];
    icon = L.divIcon({
      html: svg,
      className: "fleet-marker-icon",
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -12],
    });
    iconCache.set(operationalStatus, icon);
  }
  return icon;
}

function formatStaleness(seconds: number): string {
  if (seconds < 60) return `${seconds}dtk`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}mnt`;
  return `${Math.floor(seconds / 3600)}j ${Math.floor((seconds % 3600) / 60)}mnt`;
}

function getVolumeColor(percent: number): string {
  if (percent < 40) return "text-success";
  if (percent < 75) return "text-warning";
  return "text-destructive";
}

function TooltipRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{children}</span>
    </div>
  );
}

function FleetMarkerInner({ position }: FleetMarkerProps) {
  const staleness = useLiveStaleness(position.lastDeviceTimestamp);

  const statusConfig = OPERATIONAL_STATUS_CONFIG[position.operationalStatus];
  const hardwareConfig = HARDWARE_STATUS_CONFIG[position.hardwareStatus];
  const markerIcon = useMemo(
    () => getMarkerIcon(position.operationalStatus),
    [position.operationalStatus],
  );

  const isStale = !position.isRealTime || staleness > 180;

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={markerIcon}
    >
      <Tooltip
        direction="top"
        offset={[0, -14]}
        opacity={1}
        className="fleet-tooltip"
      >
        <div className="min-w-50 p-1">
          <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
            <span className="font-semibold text-foreground">
              {position.plateNumber}
            </span>
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: `hsl(var(--${statusConfig.colorClass.replace("bg-", "")}))` }}
              aria-hidden
            />
          </div>
          <div className="space-y-0.5">
            <TooltipRow label="Status">{statusConfig.label}</TooltipRow>
            <TooltipRow label="Hardware">{hardwareConfig.label}</TooltipRow>
            <TooltipRow label="Volume">
              <span className={getVolumeColor(position.volumePercent)}>
                {position.volumePercent}%
              </span>
            </TooltipRow>
            <TooltipRow label="Update">
              <span className={isStale ? "text-warning" : "text-foreground"}>
                {formatStaleness(staleness)} lalu
              </span>
            </TooltipRow>
            {!position.isRealTime && (
              <div className="mt-2 flex items-center gap-1.5 rounded-md bg-warning/10 px-2 py-1 text-warning">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <span className="text-[11px] font-medium">
                  Data tidak real-time
                </span>
              </div>
            )}
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

function areMarkersEqual(prev: FleetMarkerProps, next: FleetMarkerProps): boolean {
  return (
    prev.position.latitude === next.position.latitude &&
    prev.position.longitude === next.position.longitude &&
    prev.position.operationalStatus === next.position.operationalStatus &&
    prev.position.hardwareStatus === next.position.hardwareStatus &&
    prev.position.plateNumber === next.position.plateNumber &&
    prev.position.volumePercent === next.position.volumePercent &&
    prev.position.isRealTime === next.position.isRealTime &&
    prev.position.lastDeviceTimestamp === next.position.lastDeviceTimestamp
  );
}

export const FleetMarker = memo(FleetMarkerInner, areMarkersEqual);
