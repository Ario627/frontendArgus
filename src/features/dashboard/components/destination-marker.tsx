import { memo, useMemo, useCallback } from "react";
import { Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import type { DestinationType } from "../../../shared/types/common.types";
import type { DestinationMapItem } from "../../../shared/types/destination.types";

interface DestinationMarkerProps {
  destination: DestinationMapItem;
}

const DEST_TYPE_LABELS: Record<DestinationType, string> = {
  TPA: "TPA",
  RDF: "RDF",
  TPS_3R: "TPS 3R",
};

const DEST_TYPE_COLORS: Record<DestinationType, string> = {
  TPA: "hsl(142, 71%, 35%)",
  RDF: "hsl(207, 90%, 54%)",
  TPS_3R: "hsl(30, 90%, 50%)",
};

const DEST_TYPE_BG: Record<DestinationType, string> = {
  TPA: "hsl(142, 71%, 92%)",
  RDF: "hsl(207, 90%, 92%)",
  TPS_3R: "hsl(30, 90%, 92%)",
};

function destSvgIcon(type: DestinationType): string {
  const color = DEST_TYPE_COLORS[type];
  const bg = DEST_TYPE_BG[type];
  const label = type === "TPS_3R" ? "3R" : type.substring(0, 3);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <defs>
      <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
      </filter>
    </defs>
    <g filter="url(#ds)">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="${bg}" stroke="${color}" stroke-width="1.5"/>
      <circle cx="18" cy="16" r="9" fill="${color}" opacity="0.85"/>
      <text x="18" y="20" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="system-ui, sans-serif">${label}</text>
    </g>
  </svg>`;
}

const iconCache = new Map<DestinationType, L.DivIcon>();

function getDestIcon(type: DestinationType): L.DivIcon {
  let icon = iconCache.get(type);
  if (!icon) {
    icon = L.divIcon({
      html: destSvgIcon(type),
      className: "destination-marker-icon",
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -40],
      tooltipAnchor: [0, -36],
    });
    iconCache.set(type, icon);
  }
  return icon;
}

function DestinationMarkerInner({ destination }: DestinationMarkerProps) {
  const navigate = useNavigate();
  const map = useMap();

  const markerIcon = useMemo(
    () => getDestIcon(destination.type),
    [destination.type],
  );

  const handleClick = useCallback(() => {
    map.flyTo([destination.latitude, destination.longitude], 17, { duration: 0.8 });
  }, [map, destination.latitude, destination.longitude]);

  const handleDblClick = useCallback(() => {
    navigate(`/app/destination/${destination.id}`);
  }, [navigate, destination.id]);

  return (
    <Marker
      position={[destination.latitude, destination.longitude]}
      icon={markerIcon}
      eventHandlers={{
        click: handleClick,
        dblclick: handleDblClick,
      }}
    >
      <Tooltip direction="top" offset={[0, -30]} opacity={1} className="destination-tooltip">
        <div className="min-w-44 p-1">
          <div className="mb-1.5 flex items-center justify-between border-b border-border pb-1.5">
            <span className="text-sm font-semibold text-foreground">{destination.name}</span>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-3 py-0.5">
              <span className="text-[11px] text-muted-foreground">Tipe</span>
              <span
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: DEST_TYPE_BG[destination.type],
                  color: DEST_TYPE_COLORS[destination.type],
                }}
              >
                {DEST_TYPE_LABELS[destination.type]}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 py-0.5">
              <span className="text-[11px] text-muted-foreground">Kapasitas</span>
              <span className="text-xs font-medium">
                {destination.capacityKg.toLocaleString("id-ID")} kg
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 py-0.5">
              <span className="text-[11px] text-muted-foreground">Prioritas</span>
              <span className="text-xs font-medium">{destination.priority}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-0.5">
              <span className="text-[11px] text-muted-foreground">Koordinat</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {destination.latitude.toFixed(5)}, {destination.longitude.toFixed(5)}
              </span>
            </div>
            <div className="mt-1.5 border-t border-border pt-1.5">
              <p className="text-[10px] text-muted-foreground text-center">
                <span className="font-medium">Klik:</span> Zoom • <span className="font-medium">Double-klik:</span> Detail
              </p>
            </div>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

function areDestMarkersEqual(prev: DestinationMarkerProps, next: DestinationMarkerProps): boolean {
  return (
    prev.destination.id === next.destination.id &&
    prev.destination.latitude === next.destination.latitude &&
    prev.destination.longitude === next.destination.longitude &&
    prev.destination.type === next.destination.type &&
    prev.destination.name === next.destination.name &&
    prev.destination.priority === next.destination.priority &&
    prev.destination.capacityKg === next.destination.capacityKg
  );
}

export const DestinationMarker = memo(DestinationMarkerInner, areDestMarkersEqual);
