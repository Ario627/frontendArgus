import type { AnomalyKind, AnomalySeverity } from "@/shared/constants/anomaly.constant";

export interface AnomalyDto {
  readonly id: string;
  readonly batchId: string | null;
  readonly sppgId: string;
  readonly sppgNama: string;
  readonly jenis: AnomalyKind;
  readonly tingkat: AnomalySeverity;
  readonly detail: Record<string, unknown>;
  readonly dibukaAt: string;
  readonly ditutupAt: string | null;
  readonly ditutupOleh: string | null;
  readonly terbuka: boolean;
  readonly isDemo: boolean;
}

export interface CloseAnomalyResult {
  readonly anomaly: AnomalyDto;
}
