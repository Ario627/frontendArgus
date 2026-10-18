import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type { AnomalyKind, AnomalySeverity } from "@/shared/constants/anomaly.constant";
import type { CloseAnomalyResult, AnomalyDto } from "@/shared/types/anomaly.types";

export interface AnomalyQuery {
  readonly jenis?: AnomalyKind;
  readonly tingkat?: AnomalySeverity;
  readonly terbuka?: boolean;
  readonly sppgId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export function fetchAnomalies(query: AnomalyQuery): Promise<PaginatedItems<AnomalyDto>> {
  return apiGet<PaginatedItems<AnomalyDto>>(
    `${endpoints.anomalies.list}${toSearchParams({ ...query })}`
  );
}

export function closeAnomaly(anomalyId: string, catatan: string): Promise<CloseAnomalyResult> {
  return apiPost<CloseAnomalyResult>(endpoints.anomalies.close(anomalyId), { catatan });
}
