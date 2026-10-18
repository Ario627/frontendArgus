import { useEffect, useState } from "react";
import { useFleetTelemetry } from "@/features/fleet/hooks/use-fleet-telemetry";
import type { LatLng } from "@/shared/types/maps.types";

export type PositionSource = "gps" | "armada";

export interface DriverPosition {
  readonly position: LatLng | null;
  readonly source: PositionSource | null;
}

export function useDriverPosition(fleetId: string | null): DriverPosition {
  const [gps, setGps] = useState<LatLng | null>(null);
  const telemetry = useFleetTelemetry(fleetId);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (result) => {
        setGps({ lat: result.coords.latitude, lng: result.coords.longitude });
      },
      () => {
        setGps(null);
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 }
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (gps !== null) return { position: gps, source: "gps" };

  const latest = telemetry.data?.latest ?? null;
  if (latest !== null && latest.lat !== null && latest.lng !== null) {
    return { position: { lat: latest.lat, lng: latest.lng }, source: "armada" };
  }
  return { position: null, source: null };
}
