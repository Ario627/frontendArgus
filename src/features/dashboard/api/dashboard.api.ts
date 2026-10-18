import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { DashboardSummary } from "@/shared/types/dashboard.types";

export function fetchDashboardSummary(sppgId: string | null): Promise<DashboardSummary> {
  const query = sppgId === null ? "" : `?sppgId=${encodeURIComponent(sppgId)}`;
  return apiGet<DashboardSummary>(`${endpoints.dashboard.summary}${query}`);
}