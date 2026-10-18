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
