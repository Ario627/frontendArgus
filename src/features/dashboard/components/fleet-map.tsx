import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { cn } from "../../../lib/cn";
import { env } from "../../../lib/env";
import { useDelayedLoading } from "../../../shared/hooks/use-delayed-loading";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import { ErrorState } from "../../../shared/components/feedback/error-state";
import { Icon } from "../../../shared/components/ui/icon";
import type { FleetPosition } from "../../../shared/types/fleet.types";
import { FleetMarker } from "./fleet-marker";
import "leaflet/dist/leaflet.css";

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

function getBoundsExtremes(positions: FleetPosition[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  return positions.reduce(
    (acc, p) => ({
      minLat: Math.min(acc.minLat, p.latitude),
      maxLat: Math.max(acc.maxLat, p.latitude),
      minLng: Math.min(acc.minLng, p.longitude),
      maxLng: Math.max(acc.maxLng, p.longitude),
    }),
    {
      minLat: positions[0].latitude,
      maxLat: positions[0].latitude,
      minLng: positions[0].longitude,
      maxLng: positions[0].longitude,
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
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  return null;
}

function MapController({
  positions,
  onMapReady,
}: {
  positions: FleetPosition[];
  onMapReady: (map: L.Map) => void;
}) {
  const map = useMap();
  const hasInitialFitRef = useRef(false);

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    if (hasInitialFitRef.current || positions.length === 0) return;

    const validPositions = positions.filter(
      (p) => p.latitude !== 0 && p.longitude !== 0,
    );

    if (validPositions.length > 0) {
      const { minLat, maxLat, minLng, maxLng } = getBoundsExtremes(validPositions);
      const bounds = L.latLngBounds(
        L.latLng(minLat, minLng),
        L.latLng(maxLat, maxLng),
      );
      map.fitBounds(bounds, { padding: [50, 50] });
      hasInitialFitRef.current = true;
    }
  }, [map, positions]);

  return null;
}

function isInBounds(
  position: FleetPosition,
  bounds: MapBoundsState | null,
): boolean {
  if (!bounds) return true;
  return (
    position.latitude >= bounds.south &&
    position.latitude <= bounds.north &&
    position.longitude >= bounds.west &&
    position.longitude <= bounds.east
  );
}

function MapSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

function MapButton({
  onClick,
  label,
  active,
  children,
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
        "flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-foreground shadow-sm transition-all duration-200",
        "hover:border-brand/40 hover:text-brand active:scale-95",
        active && "border-brand/40 text-brand",
      )}
    >
      {children}
    </button>
  );
}

export const FleetMap = forwardRef<FleetMapRef, FleetMapProps>(
  function FleetMap(
    { positions, isLoading, isError, onRetry, isRetrying, className },
    ref,
  ) {
    const [bounds, setBounds] = useState<MapBoundsState | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSatellite, setShowSatellite] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const showSkeleton = useDelayedLoading(isLoading);

    const handleMapReady = useCallback((map: L.Map) => {
      mapRef.current = map;
    }, []);

    useImperativeHandle(ref, () => ({
      fitAll: () => {
        if (!mapRef.current || !positions || positions.length === 0) return;
        const validPositions = positions.filter(
          (p) => p.latitude !== 0 && p.longitude !== 0,
        );
        if (validPositions.length === 0) return;
        const { minLat, maxLat, minLng, maxLng } = getBoundsExtremes(validPositions);
        const bounds = L.latLngBounds(
          L.latLng(minLat, minLng),
          L.latLng(maxLat, maxLng),
        );
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      },
      locateUser: () => {
        if (!mapRef.current || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            mapRef.current?.flyTo([latitude, longitude], 15, {
              duration: 1,
            });
          },
          () => {
            // ignore 
          },
        );
      },
    }));

    const handleBoundsChange = useCallback((newBounds: MapBoundsState) => {
      setBounds(newBounds);
    }, []);

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
      const handler = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
      };
      document.addEventListener("fullscreenchange", handler);
      return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    if (showSkeleton) {
      return (
        <div
          className={cn(
            "relative h-115 w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm",
            className,
          )}
          aria-busy="true"
          aria-live="polite"
        >
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MapSkeleton />
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className={cn("h-115 w-full", className)}>
          <ErrorState
            title="Gagal memuat peta"
            message="Tidak dapat menampilkan posisi armada saat ini."
            onRetry={onRetry}
            isRetrying={isRetrying}
          />
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm",
          isFullscreen ? "fixed inset-0 z-50 h-screen rounded-none border-0" : "h-115",
          className,
        )}
      >
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom
          doubleClickZoom
          dragging
        >
          <TileLayer
            attribution={env.VITE_MAP_TILE_ATTRIBUTION}
            url={
              showSatellite
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : env.VITE_MAP_TILE_URL
            }
          />

          <MapBoundsTracker onBoundsChange={handleBoundsChange} />
          <MapInvalidator />
          <MapController positions={positions ?? []} onMapReady={handleMapReady} />

          {shouldCluster ? (
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={80}
              spiderfyOnMaxZoom
              showCoverageOnHover={false}
            >
              {visiblePositions.map((position) => (
                <FleetMarker key={position.fleetId} position={position} />
              ))}
            </MarkerClusterGroup>
          ) : (
            visiblePositions.map((position) => (
              <FleetMarker key={position.fleetId} position={position} />
            ))
          )}
        </MapContainer>

        {/* Map controls */}
        <div className="absolute right-3 top-3 z-400 flex flex-col gap-2">
          <MapButton
            label="Pusatkan semua armada"
            onClick={() =>
              (
                ref as React.MutableRefObject<FleetMapRef>
              )?.current?.fitAll?.()
            }
          >
            <Icon name="crosshair" size={16} />
          </MapButton>
          <MapButton
            label="Lokasi saya"
            onClick={() =>
              (
                ref as React.MutableRefObject<FleetMapRef>
              )?.current?.locateUser?.()
            }
          >
            <Icon name="location" size={16} />
          </MapButton>
          <MapButton
            label="Ganti layer peta"
            active={showSatellite}
            onClick={() => setShowSatellite((v) => !v)}
          >
            <Icon name="layers" size={16} />
          </MapButton>
          <MapButton
            label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            active={isFullscreen}
            onClick={toggleFullscreen}
          >
            <Icon name={isFullscreen ? "minimize" : "maximize"} size={16} />
          </MapButton>
        </div>

        {/* Overlay: no data */}
        {!isLoading && positions && positions.length === 0 && (
          <div className="absolute inset-0 z-500 flex flex-col items-center justify-center gap-2 bg-card/90 backdrop-blur-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Icon name="map-pin" className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Belum ada data posisi armada
            </p>
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              Armada yang aktif akan muncul di sini setelah mengirimkan telemetry.
            </p>
          </div>
        )}
      </div>
    );
  },
);
