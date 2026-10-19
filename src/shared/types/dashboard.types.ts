export interface DashboardGateCounts {
  readonly lolos: number;
  readonly perbaiki: number;
  readonly alihkan: number;
  readonly tolak: number;
}

export interface DashboardStatusCounts {
  readonly menungguAngkut: number;
  readonly gagalGate: number;
  readonly tersangkut: number;
  readonly selesai: number;
}

export interface DashboardSummary {
  readonly date: string;
  readonly scopeSppgId: string | null;
  readonly batch: {
    readonly total: number;
    readonly totalKg: number;
    readonly gate: DashboardGateCounts;
    readonly status: DashboardStatusCounts;
    readonly menungguPutusan: number;
  };
  readonly operasional: {
    readonly anomaliTerbuka: number;
    readonly tiketBaru: number;
  };
}

export type NarrativeStatus = "READY" | "PENDING" | "DISABLED";

export interface NarrativeView {
  readonly status: NarrativeStatus;
  readonly narasi: string | null;
  readonly model: string | null;
  readonly generatedAt: string | null;
  readonly expiresAt: string | null;
  readonly retryAfterSeconds: number | null;
  readonly reason: string | null;
}

export interface DashboardImpact {
  readonly date: string;
  readonly scopeSppgId: string | null;
  readonly biayaPerKm: number | null;
  readonly batch: {
    readonly total: number;
    readonly diterima: number;
    readonly butuhTindakLanjut: number;
    readonly ditanganiDiSumber: number;
    readonly dialihkan: number;
    readonly menungguPutusan: number;
  };
  readonly nearest: {
    readonly totalKm: number;
    readonly estimasiBiayaRp: number | null;
    readonly tidakSesuaiProfil: number;
  };
  readonly argus: {
    readonly totalKm: number;
    readonly estimasiBiayaRp: number | null;
  };
  readonly dibandingkan: number;
  readonly catatan: string;
}