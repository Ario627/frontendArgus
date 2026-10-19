import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type {
  DirectionsReportDto,
  LatLng,
  RouteAlternativesReportDto
} from "@/shared/types/maps.types";

export const formatCoordinate = (point: LatLng): string =>
  `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;

export function fetchDirections(from: LatLng, to: LatLng): Promise<DirectionsReportDto> {
  const query = new URLSearchParams({ from: formatCoordinate(from), to: formatCoordinate(to) });
  return apiGet<DirectionsReportDto>(`${endpoints.maps.directions}?${query.toString()}`);
}

export function fetchRouteAlternatives(
  from: LatLng,
  to: LatLng
): Promise<RouteAlternativesReportDto> {
  const query = new URLSearchParams({ from: formatCoordinate(from), to: formatCoordinate(to) });
  return apiGet<RouteAlternativesReportDto>(`${endpoints.maps.route}?${query.toString()}`);
}
