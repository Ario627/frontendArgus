import { memo, useMemo, useCallback } from "react";
import { Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { useLiveStaleness } from "../../../shared/hooks/use-live-staleness";
import {
  OPERATIONAL_STATUS_CONFIG,
  HARDWARE_STATUS_CONFIG,
} from "../../../shared/constants/status.constant";
import type { FleetPosition } from "../../../shared/types/fleet.types";
import type { OperationalStatus } from "../../../shared/types/common.types";

interface FleetMarkerProps {
  position: FleetPosition;
  onShow3D?: (position: FleetPosition) => void;
}

const TRUCK_SVG_ICONS: Readonly<Record<OperationalStatus, string>> = {
  ONLINE_NORMAL: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <g transform="translate(2, 6)">
      <path d="M0 10 L0 22 L5 22 L5 25 L10 25 L10 22 L26 22 L26 25 L31 25 L31 22 L36 22 L36 10 Z" fill="hsl(var(--status-normal))" stroke="white" stroke-width="1.5"/>
      <path d="M26 10 L26 16 L33 16 L33 10 Z" fill="rgba(255,255,255,0.4)" stroke="white" stroke-width="1"/>
      <rect x="2" y="12" width="8" height="6" fill="rgba(255,255,255,0.2)" rx="1"/>
      <circle cx="7.5" cy="25" r="3.5" fill="#333" stroke="white" stroke-width="1.5"/>
      <circle cx="28.5" cy="25" r="3.5" fill="#333" stroke="white" stroke-width="1.5"/>
      <circle cx="7.5" cy="25" r="1.5" fill="#888"/>
      <circle cx="28.5" cy="25" r="1.5" fill="#888"/>
    </g>
  </svg>`,
  ONLINE_BROKEN: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <g transform="translate(2, 6)">
      <path d="M0 10 L0 22 L5 22 L5 25 L10 25 L10 22 L26 22 L26 25 L31 25 L31 22 L36 22 L36 10 Z" fill="hsl(var(--status-broken))" stroke="white" stroke-width="1.5"/>
      <path d="M26 10 L26 16 L33 16 L33 10 Z" fill="rgba(255,255,255,0.4)" stroke="white" stroke-width="1"/>
      <rect x="2" y="12" width="8" height="6" fill="rgba(255,255,255,0.2)" rx="1"/>
      <circle cx="7.5" cy="25" r="3.5" fill="#333" stroke="white" stroke-width="1.5"/>
      <circle cx="28.5" cy="25" r="3.5" fill="#333" stroke="white" stroke-width="1.5"/>
      <circle cx="7.5" cy="25" r="1.5" fill="#888"/>
      <circle cx="28.5" cy="25" r="1.5" fill="#888"/>
      <path d="M14 5 L22 13 M22 5 L14 13" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  </svg>`,
  STALE: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <g transform="translate(2, 6)">
      <path d="M0 10 L0 22 L5 22 L5 25 L10 25 L10 22 L26 22 L26 25 L31 25 L31 22 L36 22 L36 10 Z" fill="hsl(var(--status-stale))" stroke="white" stroke-width="1.5"/>
      <path d="M26 10 L26 16 L33 16 L33 10 Z" fill="rgba(255,255,255,0.4)" stroke="white" stroke-width="1"/>
      <rect x="2" y="12" width="8" height="6" fill="rgba(255,255,255,0.2)" rx="1"/>
      <circle cx="7.5" cy="25" r="3.5" fill="#333" stroke="white" stroke-width="1.5"/>
      <circle cx="28.5" cy="25" r="3.5" fill="#333" stroke="white" stroke-width="1.5"/>
      <circle cx="7.5" cy="25" r="1.5" fill="#888"/>
      <circle cx="28.5" cy="25" r="1.5" fill="#888"/>
      <circle cx="18" cy="9" r="2" fill="white"/>
    </g>
  </svg>`,
  OFFLINE: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <g transform="translate(2, 6)">
      <path d="M0 10 L0 22 L5 22 L5 25 L10 25 L10 22 L26 22 L26 25 L31 25 L31 22 L36 22 L36 10 Z" fill="hsl(var(--status-offline))" stroke="white" stroke-width="1.5" opacity="0.7"/>
      <path d="M26 10 L26 16 L33 16 L33 10 Z" fill="rgba(255,255,255,0.3)" stroke="white" stroke-width="1"/>
      <rect x="2" y="12" width="8" height="6" fill="rgba(255,255,255,0.15)" rx="1"/>
      <circle cx="7.5" cy="25" r="3.5" fill="#555" stroke="white" stroke-width="1.5"/>
      <circle cx="28.5" cy="25" r="3.5" fill="#555" stroke="white" stroke-width="1.5"/>
      <circle cx="7.5" cy="25" r="1.5" fill="#777"/>
      <circle cx="28.5" cy="25" r="1.5" fill="#777"/>
      <path d="M12 14 L24 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  </svg>`,
};

const iconCache = new Map<OperationalStatus, L.DivIcon>();

function getMarkerIcon(operationalStatus: OperationalStatus): L.DivIcon {
  let icon = iconCache.get(operationalStatus);
  if (!icon) {
    const svg = TRUCK_SVG_ICONS[operationalStatus];
    icon = L.divIcon({
      html: svg,
      className: "fleet-marker-icon fleet-truck-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 32],
      popupAnchor: [0, -28],
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

const ZOOM_3D_THRESHOLD = 15;

function FleetMarkerInner({ position, onShow3D }: FleetMarkerProps) {
  const navigate = useNavigate();
  const map = useMap();
  const staleness = useLiveStaleness(position.lastDeviceTimestamp);

  const statusConfig = OPERATIONAL_STATUS_CONFIG[position.operationalStatus];
  const hardwareConfig = HARDWARE_STATUS_CONFIG[position.hardwareStatus];
  const markerIcon = useMemo(
    () => getMarkerIcon(position.operationalStatus),
    [position.operationalStatus],
  );

  const isStale = !position.isRealTime || staleness > 180;

  const handleMarkerClick = useCallback(() => {
    const currentZoom = map.getZoom();
    if (currentZoom >= ZOOM_3D_THRESHOLD && onShow3D) {
      onShow3D(position);
    } else {
      map.flyTo([position.latitude, position.longitude], ZOOM_3D_THRESHOLD + 2, {
        duration: 1,
      });
    }
  }, [map, position, onShow3D]);

  const handleMarkerDblClick = useCallback(() => {
    navigate(`/app/fleet/${position.fleetId}`);
  }, [navigate, position.fleetId]);

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={markerIcon}
      eventHandlers={{
        click: handleMarkerClick,
        dblclick: handleMarkerDblClick,
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -20]}
        opacity={1}
        className="fleet-tooltip"
      >
        <div className="min-w-52 p-1">
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
              <div className="mt-2 flex items-center gap-1.5 bg-warning/10 px-2 py-1 text-warning">
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
            <div className="mt-2 border-t border-border pt-2">
              <p className="text-[10px] text-muted-foreground text-center">
                <span className="font-medium">Klik:</span> Zoom / Lihat 3D • <span className="font-medium">Double-klik:</span> Detail
              </p>
            </div>
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
    prev.position.lastDeviceTimestamp === next.position.lastDeviceTimestamp &&
    prev.position.fleetId === next.position.fleetId
  );
}

export const FleetMarker = memo(FleetMarkerInner, areMarkersEqual);