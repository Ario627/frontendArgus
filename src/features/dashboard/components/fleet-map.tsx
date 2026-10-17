import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  lazy,
  Suspense,
} from "react";
import { MapContainer, TileLayer, useMap, useMapEvents, Polyline, LayersControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { cn } from "../../../lib/cn";
import { env } from "../../../lib/env";
import { useDelayedLoading } from "../../../shared/hooks/use-delayed-loading";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import { ErrorState } from "../../../shared/components/feedback/error-state";
import { Icon } from "../../../shared/components/ui/icon";
import type { FleetPosition } from "../../../shared/types/fleet.types";
import type { DestinationMapItem } from "../../../shared/types/destination.types";
import { FleetMarker } from "./fleet-marker";
import { DestinationMarker } from "./destination-marker";
import "leaflet/dist/leaflet.css";

const Truck3DViewer = lazy(() =>
  import("./truck-3d-viewer").then((m) => ({ default: m.Truck3DViewer }))
);

export interface FleetMapRef {
  fitAll: () => void;
  locateUser: () => void;
}

interface FleetMapProps {
  positions: FleetPosition[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  destinations?: DestinationMapItem[];
  areDestinationsLoading?: boolean;
}

const DEFAULT_CENTER: [number, number] = [-6.2, 106.816666];
const DEFAULT_ZOOM = 12;
const CLUSTER_THRESHOLD = 20;

interface MapBoundsState {
  north: number;
  south: number;
  east: number;
  west: number;
}

function getBoundsExtremes(allPoints: Array<{ lat: number; lng: number }>): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  return allPoints.reduce(
    (acc, p) => ({
      minLat: Math.min(acc.minLat, p.lat),
      maxLat: Math.max(acc.maxLat, p.lat),
      minLng: Math.min(acc.minLng, p.lng),
      maxLng: Math.max(acc.maxLng, p.lng),
    }),
    {
      minLat: allPoints[0].lat,
      maxLat: allPoints[0].lat,
      minLng: allPoints[0].lng,
      maxLng: allPoints[0].lng,
    },
  );
}

function MapBoundsTracker({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: MapBoundsState) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    onBoundsChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  }, [map, onBoundsChange]);

  return null;
}

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => { map.invalidateSize(); });
    const container = map.getContainer();
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
}

function MapController({
  positions,
  destinations,
  onMapReady,
}: {
  positions: FleetPosition[];
  destinations?: DestinationMapItem[];
  onMapReady: (map: L.Map) => void;
}) {
  const map = useMap();
  const hasInitialFitRef = useRef(false);

  useEffect(() => { onMapReady(map); }, [map, onMapReady]);

  useEffect(() => {
    if (hasInitialFitRef.current) return;

    const validPositions = positions.filter((p) => p.latitude !== 0 && p.longitude !== 0);
    const allPoints: Array<{ lat: number; lng: number }> = [
      ...validPositions.map((p) => ({ lat: p.latitude, lng: p.longitude })),
      ...(destinations ?? []).map((d) => ({ lat: d.latitude, lng: d.longitude })),
    ];

    if (allPoints.length > 0) {
      const { minLat, maxLat, minLng, maxLng } = getBoundsExtremes(allPoints);
      map.fitBounds(L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng)), { padding: [50, 50] });
      hasInitialFitRef.current = true;
    }
  }, [map, positions, destinations]);

  return null;
}

function isInBounds(
  point: { latitude: number; longitude: number },
  bounds: MapBoundsState | null,
): boolean {
  if (!bounds) return true;
  return point.latitude >= bounds.south && point.latitude <= bounds.north &&
    point.longitude >= bounds.west && point.longitude <= bounds.east;
}

function MapSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6">
      <Skeleton className="h-12 w-12" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

function MapButton({
  onClick, label, active, children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center border bg-card text-foreground transition-all duration-200 cursor-pointer",
        "hover:border-brand/40 hover:text-brand active:scale-95",
        active && "border-brand/40 text-brand",
      )}
    >
      {children}
    </button>
  );
}

function buildFleetToDestLines(
  positions: FleetPosition[],
  destinations: DestinationMapItem[],
): Array<{ fleetId: string; plateNumber: string; from: [number, number]; to: [number, number] }> {
  const lines: Array<{ fleetId: string; plateNumber: string; from: [number, number]; to: [number, number] }> = [];
  if (!positions.length || !destinations.length) return lines;

  const tpaDest = destinations.find((d) => d.type === "TPA");
  if (!tpaDest) return lines;

  const target: [number, number] = [tpaDest.latitude, tpaDest.longitude];

  for (const pos of positions) {
    if (pos.latitude === 0 && pos.longitude === 0) continue;
    if (pos.operationalStatus === "OFFLINE") continue;
    lines.push({
      fleetId: pos.fleetId,
      plateNumber: pos.plateNumber,
      from: [pos.latitude, pos.longitude],
      to: target,
    });
  }

  return lines;
}

const FLEET_LINE_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
];

function FleetToTPALayer({
  positions,
  destinations,
  visible,
}: {
  positions: FleetPosition[];
  destinations: DestinationMapItem[];
  visible: boolean;
}) {
  if (!visible) return null;

  const lines = useMemo(
    () => buildFleetToDestLines(positions, destinations),
    [positions, destinations],
  );

  if (!lines.length) return null;

  return (
    <>
      {lines.map((line, idx) => (
        <Polyline
          key={`line-${line.fleetId}`}
          positions={[line.from, line.to]}
          pathOptions={{
            color: FLEET_LINE_COLORS[idx % FLEET_LINE_COLORS.length],
            weight: 2,
            opacity: 0.5,
            dashArray: "6 4",
          }}
        />
      ))}
    </>
  );
}

export const FleetMap = forwardRef<FleetMapRef, FleetMapProps>(
  function FleetMap(
    { positions, isLoading, isError, onRetry, isRetrying, className, destinations, areDestinationsLoading },
    ref,
  ) {
    const [bounds, setBounds] = useState<MapBoundsState | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSatellite, setShowSatellite] = useState(false);
    const [showDestinations, setShowDestinations] = useState(true);
    const [showRoutes, setShowRoutes] = useState(false);
    const [selectedTruck3D, setSelectedTruck3D] = useState<FleetPosition | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const showSkeleton = useDelayedLoading(isLoading);

    const handleMapReady = useCallback((map: L.Map) => { mapRef.current = map; }, []);
    const handleShow3D = useCallback((position: FleetPosition) => { setSelectedTruck3D(position); }, []);
    const handleClose3D = useCallback(() => { setSelectedTruck3D(null); }, []);

    useImperativeHandle(ref, () => ({
      fitAll: () => {
        if (!mapRef.current) return;
        const validPositions = (positions ?? []).filter((p) => p.latitude !== 0 && p.longitude !== 0);
        const allPoints: Array<{ lat: number; lng: number }> = [
          ...validPositions.map((p) => ({ lat: p.latitude, lng: p.longitude })),
          ...(destinations ?? []).map((d) => ({ lat: d.latitude, lng: d.longitude })),
        ];
        if (!allPoints.length) return;
        const { minLat, maxLat, minLng, maxLng } = getBoundsExtremes(allPoints);
        mapRef.current.fitBounds(L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng)), { padding: [50, 50] });
      },
      locateUser: () => {
        if (!mapRef.current || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => { mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1 }); },
          () => {},
        );
      },
    }));

    const handleBoundsChange = useCallback((newBounds: MapBoundsState) => { setBounds(newBounds); }, []);

    const visiblePositions = useMemo(() => {
      if (!positions) return [];
      return positions.filter((p) => isInBounds(p, bounds));
    }, [positions, bounds]);

    const shouldCluster = visiblePositions.length >= CLUSTER_THRESHOLD;

    const toggleFullscreen = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;
      if (!document.fullscreenElement) {
        container.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }, []);

    useEffect(() => {
      const handler = () => { setIsFullscreen(Boolean(document.fullscreenElement)); };
      document.addEventListener("fullscreenchange", handler);
      return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    if (showSkeleton) {
      return (
        <div className={cn("relative h-115 w-full overflow-hidden border border-border bg-card", className)} aria-busy="true" aria-live="polite">
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          <div className="absolute inset-0 flex items-center justify-center"><MapSkeleton /></div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className={cn("h-115 w-full", className)}>
          <ErrorState title="Gagal memuat peta" message="Tidak dapat menampilkan posisi armada saat ini." onRetry={onRetry} isRetrying={isRetrying} />
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          "group relative w-full overflow-hidden border border-border bg-card",
          isFullscreen ? "fixed inset-0 z-50 h-screen rounded-none border-0" : "h-115",
          className,
        )}
      >
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full" scrollWheelZoom doubleClickZoom dragging>
          <TileLayer
            attribution={env.VITE_MAP_TILE_ATTRIBUTION}
            url={showSatellite
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : env.VITE_MAP_TILE_URL}
          />

          <MapBoundsTracker onBoundsChange={handleBoundsChange} />
          <MapInvalidator />
          <MapController positions={positions ?? []} destinations={destinations} onMapReady={handleMapReady} />

          <FleetToTPALayer positions={positions ?? []} destinations={destinations ?? []} visible={showRoutes} />

          {shouldCluster ? (
            <MarkerClusterGroup chunkedLoading maxClusterRadius={80} spiderfyOnMaxZoom showCoverageOnHover={false}>
              {visiblePositions.map((position) => (
                <FleetMarker key={position.fleetId} position={position} onShow3D={handleShow3D} />
              ))}
            </MarkerClusterGroup>
          ) : (
            visiblePositions.map((position) => (
              <FleetMarker key={position.fleetId} position={position} onShow3D={handleShow3D} />
            ))
          )}

          {showDestinations && destinations?.map((dest) => (
            <DestinationMarker key={dest.id} destination={dest} />
          ))}
        </MapContainer>

        <div className="absolute right-3 top-3 z-400 flex flex-col gap-2">
          <MapButton label="Pusatkan semua" onClick={() => (ref as React.MutableRefObject<FleetMapRef>)?.current?.fitAll?.()}>
            <Icon name="crosshair" size={16} />
          </MapButton>
          <MapButton label="Lokasi saya" onClick={() => (ref as React.MutableRefObject<FleetMapRef>)?.current?.locateUser?.()}>
            <Icon name="location" size={16} />
          </MapButton>
          <MapButton label="Ganti layer peta" active={showSatellite} onClick={() => setShowSatellite((v) => !v)}>
            <Icon name="layers" size={16} />
          </MapButton>
          <MapButton label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"} active={isFullscreen} onClick={toggleFullscreen}>
            <Icon name={isFullscreen ? "minimize" : "maximize"} size={16} />
          </MapButton>

          <div className="my-1 border-t border-border" />

          <MapButton label="Tampilkan/sembunyikan destinasi" active={showDestinations} onClick={() => setShowDestinations((v) => !v)}>
            <Icon name="map-pin" size={16} />
          </MapButton>
          <MapButton label="Tampilkan/sembunyikan rute ke TPA" active={showRoutes} onClick={() => setShowRoutes((v) => !v)}>
            <Icon name="route" size={16} />
          </MapButton>
        </div>

        {!isLoading && positions && positions.length === 0 && (
          <div className="absolute inset-0 z-500 flex flex-col items-center justify-center gap-2 bg-card/90">
            <div className="inline-flex h-12 w-12 items-center justify-center border border-border bg-muted">
              <Icon name="map-pin" className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Belum ada data posisi armada</p>
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              Armada yang aktif akan muncul di sini setelah mengirimkan telemetry.
            </p>
          </div>
        )}

        {selectedTruck3D && (
          <Suspense fallback={null}>
            <Truck3DViewer position={selectedTruck3D} onClose={handleClose3D} />
          </Suspense>
        )}
      </div>
    );
  },
);
