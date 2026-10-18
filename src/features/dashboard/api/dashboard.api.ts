import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { DashboardSummary, NarrativeView } from "@/shared/types/dashboard.types";

export function fetchDashboardSummary(sppgId: string | null): Promise<DashboardSummary> {
  const query = sppgId === null ? "" : `?sppgId=${encodeURIComponent(sppgId)}`;
  return apiGet<DashboardSummary>(`${endpoints.dashboard.summary}${query}`);
}

export interface NarrativeQuery {
  readonly sppgId: string | null;
  readonly refresh?: boolean;
}

export function fetchDashboardNarrative(query: NarrativeQuery): Promise<NarrativeView> {
  const params = new URLSearchParams();
  if (query.sppgId !== null) params.set("sppgId", query.sppgId);
  if (query.refresh === true) params.set("refresh", "true");
  const suffix = params.size === 0 ? "" : `?${params.toString()}`;
  return apiGet<NarrativeView>(`${endpoints.dashboard.narrative}${suffix}`);
}