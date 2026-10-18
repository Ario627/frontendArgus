import type { UserRole } from "@/shared/constants/roles.constant";

export interface AuditLogDto {
  readonly id: number;
  readonly aktor: string | null;
  readonly aktorPeran: UserRole | null;
  readonly aksi: string;
  readonly entitas: string | null;
  readonly entitasId: string | null;
  readonly detail: Record<string, unknown>;
  readonly requestId: string | null;
  readonly ts: string;
}
