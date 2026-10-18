import type { TicketKind } from "@/shared/constants/ticket.constant";

export const SPPG_SLUG_PATTERN = /^[a-z2-7]{12}$/;
export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 800;
export const TEXT_SAFE_PATTERN = /^[\P{Cc}\n\t]+$/u;

export interface ReportKindOption {
  readonly value: TicketKind;
  readonly label: string;
  readonly example: string;
}

export const REPORT_KIND_OPTIONS: readonly ReportKindOption[] = Object.freeze([
  {
    value: "bau",
    label: "Bau",
    example: "Bau menyengat dari area belakang dapur"
  },
  {
    value: "limbah_cair",
    label: "Air limbah",
    example: "Air cucian mengalir ke saluran di luar pagar"
  },
  {
    value: "tumpukan",
    label: "Tumpukan sampah",
    example: "Sisa makanan menumpuk di dekat pagar"
  },
  {
    value: "lainnya",
    label: "Lainnya",
    example: "Hal lain yang Anda lihat di sekitar dapur"
  }
]);

export interface ReportDraft {
  readonly jenis: TicketKind | null;
  readonly deskripsi: string;
  readonly website: string;
}

export type ReportValidationReason =
  | "KIND_REQUIRED"
  | "DESCRIPTION_TOO_SHORT"
  | "DESCRIPTION_TOO_LONG"
  | "DESCRIPTION_INVALID";

export interface ReportValidationResult {
  readonly ok: boolean;
  readonly reason?: ReportValidationReason;
  readonly message?: string;
}

export function isHoneypotFilled(draft: ReportDraft): boolean {
  return draft.website.trim() !== "";
}

export function validateReportDraft(draft: ReportDraft): ReportValidationResult {
  if (draft.jenis === null) {
    return { ok: false, reason: "KIND_REQUIRED", message: "Pilih jenis masalah terlebih dahulu." };
  }
  const trimmed = draft.deskripsi.trim();
  if (trimmed.length < DESCRIPTION_MIN) {
    return {
      ok: false,
      reason: "DESCRIPTION_TOO_SHORT",
      message: `Ceritakan sedikit lebih lengkap (minimal ${DESCRIPTION_MIN} karakter).`
    };
  }
  if (trimmed.length > DESCRIPTION_MAX) {
    return {
      ok: false,
      reason: "DESCRIPTION_TOO_LONG",
      message: `Deskripsi maksimal ${DESCRIPTION_MAX} karakter.`
    };
  }
  if (!TEXT_SAFE_PATTERN.test(trimmed)) {
    return {
      ok: false,
      reason: "DESCRIPTION_INVALID",
      message: "Deskripsi memuat karakter yang tidak didukung."
    };
  }
  return { ok: true };
}