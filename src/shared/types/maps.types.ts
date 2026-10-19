export interface LatLng {
  readonly lat: number;
  readonly lng: number;
}

export type DirectionsSource = "mapbox" | "garis-lurus";

export interface DirectionStepDto {
  readonly instruction: string;
  readonly distanceMeters: number;
  readonly durationSeconds: number;
  readonly maneuverType: string | null;
  readonly maneuverModifier: string | null;
  readonly location: LatLng | null;
}

export interface DirectionsReportDto {
  readonly source: DirectionsSource;
  readonly lowConfidence: boolean;
  readonly distanceMeters: number;
  readonly durationSeconds: number;
  readonly bearingDeg: number;
  readonly compass: string;
  readonly polyline: string | null;
  readonly path: readonly LatLng[];
  readonly steps: readonly DirectionStepDto[];
}

export type CongestionLevel = "lancar" | "padat" | "macet";

export type RoutingProvider = "google" | "mapbox" | "osrm" | "garis-lurus";

export interface RouteAlternativeDto {
  readonly id: string;
  readonly label: string;
  readonly via: string | null;
  readonly distanceMeters: number;
  readonly durationSeconds: number;
  readonly durationInTrafficSeconds: number;
  readonly congestion: CongestionLevel;
  readonly congestionScore: number;
  readonly trafficKnown: boolean;
  readonly path: readonly LatLng[];
  readonly polyline: string | null;
  readonly steps: readonly DirectionStepDto[];
}

export interface RouteAlternativesReportDto {
  readonly provider: RoutingProvider;
  readonly trafficAware: boolean;
  readonly updatedAt: string;
  readonly from: LatLng;
  readonly to: LatLng;
  readonly recommendedId: string;
  readonly alternatives: readonly RouteAlternativeDto[];
  readonly note: string | null;
}

export const CONGESTION_LABELS: Readonly<Record<CongestionLevel, string>> = Object.freeze({
  lancar: "Lancar",
  padat: "Agak padat",
  macet: "Macet"
});

export const CONGESTION_HINTS: Readonly<Record<CongestionLevel, string>> = Object.freeze({
  lancar: "Disarankan",
  padat: "Sedang ramai",
  macet: "Hindari bila bisa"
});

export const ROUTING_PROVIDER_LABELS: Readonly<Record<RoutingProvider, string>> = Object.freeze({
  google: "lalu lintas Google",
  mapbox: "lalu lintas Mapbox",
  osrm: "peta OpenStreetMap",
  "garis-lurus": "perkiraan arah lurus"
});

export const CONGESTION_TONE: Readonly<
  Record<CongestionLevel, { readonly dot: string; readonly text: string; readonly chip: string }>
> = Object.freeze({
  lancar: { dot: "bg-daun", text: "text-daun", chip: "border-daun/50 text-daun" },
  padat: { dot: "bg-kunyit", text: "text-kunyit", chip: "border-kunyit/60 text-kunyit" },
  macet: { dot: "bg-bata", text: "text-bata", chip: "border-bata/50 text-bata" }
});
