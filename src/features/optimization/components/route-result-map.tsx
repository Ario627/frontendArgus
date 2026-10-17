import { useMemo } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from "react-leaflet";
import { env } from "../../../lib/env";
import { cn } from "../../../lib/cn";
import L from "leaflet";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import type { RouteResult, RouteStop } from "../../../shared/types/optimization.types";
import "leaflet/dist/leaflet.css";

interface RouteResultMapProps {
  routes: readonly RouteResult[] | undefined;
  isLoading: boolean;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [-6.2, 106.816666];
const DEFAULT_ZOOM = 12;

const ROUTE_COLORS = Object.freeze([
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ca8a04",
  "#9333ea",
  "#0891b2",
  "#db2777",
  "#65a30d",
] as const);

interface ParsedStop {
  readonly destId: string;
  readonly destName?: string;
  readonly lat: number;
  readonly lng: number;
  readonly order: number;
}

function buildRouteStops(route: RouteResult): readonly ParsedStop[] {
  return route.stops
    .filter((stop): stop is RouteStop & { destLat: number; destLng: number } =>
      stop.destLat !== undefined && stop.destLng !== undefined,
    )
    .map((stop) => ({
      destId: stop.destId,
      destName: stop.destName,
      lat: stop.destLat,
      lng: stop.destLng,
      order: stop.order,
    }))
    .sort((a, b) => a.order - b.order);
}

export function RouteResultMap({ routes, isLoading, className }: RouteResultMapProps) {
  const routeSegments = useMemo(() => {
    if (!routes) return [];
    return routes.map((route, idx) => {
      const stops = buildRouteStops(route);
      const positions: [number, number][] = stops.map((s) => [s.lat, s.lng]);
      const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
      return { routeId: route.vehicleId, positions, color, stops };
    });
  }, [routes]);

  const hasValidSegments = routeSegments.some((s) => s.positions.length > 0);

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative h-100 w-full overflow-hidden border border-border",
          className,
        )}
      >
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Memuat peta rute...</div>
        </div>
      </div>
    );
  }

  if (!hasValidSegments) {
    return (
      <div className={cn("h-100 w-full", className)}>
        <EmptyState
          title="Peta rute belum tersedia"
          description="Hasil optimasi belum memiliki koordinat yang valid untuk dipetakan."
        />
      </div>
    );
  }

  const allPositions = routeSegments.flatMap((s) => s.positions);
  const bounds = L.latLngBounds(allPositions.length > 0 ? allPositions : [DEFAULT_CENTER]);

  return (
    <div
      className={cn(
        "relative h-100 w-full overflow-hidden border border-border",
        className,
      )}
    >
      <MapContainer
        center={bounds.getCenter()}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={env.VITE_MAP_TILE_ATTRIBUTION}
          url={env.VITE_MAP_TILE_URL}
        />
        {routeSegments.map((segment) => (
          <Polyline
            key={segment.routeId}
            positions={segment.positions}
            pathOptions={{ color: segment.color, weight: 3, opacity: 0.7 }}
          />
        ))}
        {routeSegments.map((segment) =>
          segment.stops.map((stop) => (
            <CircleMarker
              key={`${segment.routeId}-${stop.destId}-${stop.order}`}
              center={[stop.lat, stop.lng]}
              radius={5}
              pathOptions={{
                color: segment.color,
                fillColor: segment.color,
                fillOpacity: 0.8,
              }}
            >
              <Tooltip direction="top" opacity={0.9}>
                <div className="text-xs">
                  <div className="font-semibold">{stop.destName ?? stop.destId}</div>
                  <div>Stop #{stop.order}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          )),
        )}
      </MapContainer>
    </div>
  );
}
