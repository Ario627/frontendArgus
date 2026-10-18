import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/shared/types/maps.types";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export interface NavMapProps {
  readonly from: LatLng;
  readonly to: LatLng;
  readonly path: readonly LatLng[];
}

export function NavMap({ from, to, path }: NavMapProps) {
  const line: [number, number][] =
    path.length >= 2
      ? path.map((point) => [point.lat, point.lng] as [number, number])
      : [
          [from.lat, from.lng],
          [to.lat, to.lng]
        ];
  const center: [number, number] = [(from.lat + to.lat) / 2, (from.lng + to.lng) / 2];

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <Polyline positions={line} pathOptions={{ color: "var(--color-biru-tinta)", weight: 3 }} />
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
          color: "var(--color-kunyit)",
          fillColor: "var(--color-kunyit)",
          fillOpacity: 0.9,
          weight: 2
        }}
      />
    </MapContainer>
  );
}

export default NavMap;
