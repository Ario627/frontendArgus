import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from "@/shared/lib/map-tiles";
import type { LatLng, RouteAlternativeDto } from "@/shared/types/maps.types";

const CONGESTION_COLORS: Readonly<Record<string, string>> = Object.freeze({
  lancar: "var(--color-daun)",
  padat: "var(--color-kunyit)",
  macet: "var(--color-bata)"
});

export interface NavMapProps {
  readonly from: LatLng;
  readonly to: LatLng;
  readonly alternatives: readonly RouteAlternativeDto[];
  readonly selectedId: string;
}

const toPositions = (path: readonly LatLng[], from: LatLng, to: LatLng): [number, number][] =>
  path.length >= 2
    ? path.map((point) => [point.lat, point.lng] as [number, number])
    : [
        [from.lat, from.lng],
        [to.lat, to.lng]
      ];

export function NavMap({ from, to, alternatives, selectedId }: NavMapProps) {
  const center: [number, number] = [(from.lat + to.lat) / 2, (from.lng + to.lng) / 2];
  const ordered = [...alternatives].sort((left, right) =>
    left.id === selectedId ? 1 : right.id === selectedId ? -1 : 0
  );

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer url={MAP_TILE_URL} attribution={MAP_TILE_ATTRIBUTION} />
      {ordered.map((alternative) => {
        const active = alternative.id === selectedId;
        return (
          <Polyline
            key={alternative.id}
            positions={toPositions(alternative.path, from, to)}
            pathOptions={{
              color: CONGESTION_COLORS[alternative.congestion] ?? "var(--color-biru-tinta)",
              weight: active ? 6 : 4,
              opacity: active ? 0.95 : 0.38,
              dashArray: active ? undefined : "2 8",
              lineCap: "round"
            }}
          />
        );
      })}
      <CircleMarker
        center={[from.lat, from.lng]}
        radius={7}
        pathOptions={{
          color: "var(--color-ink)",
          fillColor: "var(--color-ink)",
          fillOpacity: 1,
          weight: 2
        }}
      />
      <CircleMarker
        center={[to.lat, to.lng]}
        radius={9}
        pathOptions={{
          color: "var(--color-biru-tinta)",
          fillColor: "var(--color-biru-tinta)",
          fillOpacity: 0.9,
          weight: 2
        }}
      />
    </MapContainer>
  );
}

export default NavMap;
