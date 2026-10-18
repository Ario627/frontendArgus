import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { describeFleet } from "@/features/fleet/liveness";
import type { FleetStatus } from "@/shared/constants/fleet.constant";
import type { FleetDto } from "@/shared/types/fleet.types";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const STATUS_COLORS: Readonly<Record<FleetStatus, string>> = Object.freeze({
  ONLINE_NORMAL: "var(--color-daun)",
  ONLINE_BROKEN: "var(--color-bata)",
  STALE: "var(--color-kunyit)",
  OFFLINE: "var(--color-ink-lemah)"
});

const DEFAULT_CENTER: readonly [number, number] = [-6.9147, 107.6098];
const DEFAULT_ZOOM = 11;

export interface FleetMapProps {
  readonly fleets: readonly FleetDto[];
}

export function FleetMap({ fleets }: FleetMapProps) {
  const positioned = fleets.filter(
    (fleet): fleet is FleetDto & { lastLat: number; lastLng: number } =>
      fleet.lastLat !== null && fleet.lastLng !== null
  );

  const center: readonly [number, number] =
    positioned.length === 0
      ? DEFAULT_CENTER
      : [
          positioned.reduce((sum, fleet) => sum + fleet.lastLat, 0) / positioned.length,
          positioned.reduce((sum, fleet) => sum + fleet.lastLng, 0) / positioned.length
        ];

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      {positioned.map((fleet) => (
        <CircleMarker
          key={fleet.id}
          center={[fleet.lastLat, fleet.lastLng]}
          radius={9}
          pathOptions={{
            color: STATUS_COLORS[fleet.statusOperasional],
            fillColor: STATUS_COLORS[fleet.statusOperasional],
            fillOpacity: 0.85,
            weight: 2
          }}
        >
          <Popup>
            <span className="font-mono text-xs">{fleet.kode}</span>
            <br />
            <span className="text-xs">{describeFleet(fleet.statusOperasional, fleet.stalenessSeconds)}</span>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default FleetMap;