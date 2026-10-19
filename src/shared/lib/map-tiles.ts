const rawUrl = (import.meta.env as Record<string, string | undefined>)["VITE_MAP_TILE_URL"];
const rawLabel = (import.meta.env as Record<string, string | undefined>)["VITE_MAP_TILE_LABEL"];

export const MAP_TILE_URL =
  rawUrl !== undefined && rawUrl.trim().length > 0
    ? rawUrl
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const MAP_TILE_LABEL =
  rawLabel !== undefined && rawLabel.trim().length > 0
    ? rawLabel
    : rawUrl !== undefined
      ? "kustom"
      : "CARTO / OpenStreetMap";
