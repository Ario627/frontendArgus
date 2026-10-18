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