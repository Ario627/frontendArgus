export const DIGIT_REASONS = Object.freeze([
  "SAMPEL_KURANG",
  "AMBANG_BELUM_TERKALIBRASI",
  "PROPORSI_DIGIT_TINGGI",
  "DALAM_AMBANG"
] as const);

export type DigitReason = (typeof DIGIT_REASONS)[number];

export const DIGIT_REASON_LABELS: Readonly<Record<DigitReason, string>> = Object.freeze({
  SAMPEL_KURANG: "Sampel kurang",
  AMBANG_BELUM_TERKALIBRASI: "Ambang belum dikalibrasi",
  PROPORSI_DIGIT_TINGGI: "Proporsi digit tinggi",
  DALAM_AMBANG: "Dalam ambang"
});

export interface DigitScanEntry {
  readonly sppgId: string;
  readonly reason: DigitReason;
  readonly flagged: boolean;
  readonly sampleCount: number;
  readonly digitCount: number;
  readonly proportion: number;
  readonly threshold: number | null;
  readonly persisted: boolean;
  readonly closed: number;
}

export interface DigitScanFailure {
  readonly sppgId: string;
  readonly reason: string;
}

export interface DigitScanInsufficient {
  readonly sppgId: string;
  readonly manualCount: number;
}

export interface DigitScanResult {
  readonly status: "OK" | "PARTIAL";
  readonly window: {
    readonly dateFrom: string;
    readonly dateTo: string;
    readonly lookbackDays: number;
  };
  readonly threshold: number | null;
  readonly sampleSize: number;
  readonly sampleMin: number;
  readonly scanned: number;
  readonly insufficient: readonly DigitScanInsufficient[];
  readonly failures: readonly DigitScanFailure[];
  readonly entries: readonly DigitScanEntry[];
}

export interface DigitScanInput {
  readonly sppgId?: string;
  readonly lookbackDays?: number;
}

export const DIGIT_LOOKBACK_MIN_DAYS = 7;
export const DIGIT_LOOKBACK_MAX_DAYS = 365;
