import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type { AuditLogDto } from "@/shared/types/audit.types";

export interface AuditQuery {
  readonly aktor?: string;
  readonly aksi?: string;
  readonly entitas?: string;
  readonly from?: string;
  readonly to?: string;
  readonly page?: number;
  readonly limit?: number;
}

export function fetchAuditLogs(query: AuditQuery): Promise<PaginatedItems<AuditLogDto>> {
  return apiGet<PaginatedItems<AuditLogDto>>(
    `${endpoints.audit.list}${toSearchParams({ ...query })}`
  );
}
