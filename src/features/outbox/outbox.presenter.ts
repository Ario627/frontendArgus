import { formatKg, formatMoment } from "@/shared/lib/format";
import type { OutboxError, OutboxItem } from "@/shared/types/outbox.types";

const ERROR_LABELS: Readonly<Record<string, string>> = Object.freeze({
  BATCH_TIME_TOO_OLD: "Waktu kejadian lebih dari 24 jam yang lalu",
  BATCH_TIME_IN_FUTURE: "Waktu kejadian di masa depan",
  BATCH_WEIGHT_RANGE: "Berat di luar rentang yang diizinkan",
  BATCH_FRACTIONS_INVALID: "Komposisi fraksi tidak valid",
  FRACTION_REQUIRED_FOR_ORGANIK: "Fraksi wajib diisi untuk limbah organik",
  FRACTION_SUM_OVER: "Total fraksi melebihi 100%",
  FRACTION_NOT_ALLOWED_FOR_MINYAK: "Aliran minyak tidak memakai fraksi",
  FRACTION_UNKNOWN_KEY: "Kode fraksi tidak dikenal",
  FRACTION_VALUE_RANGE: "Nilai fraksi di luar rentang",
  GATE_NOT_RETRYABLE: "Gerbang tidak bisa dinilai ulang sekarang",
  LEDGER_SIDE_REQUIRED: "Sisi serah terima wajib ditentukan",
  SYNC_TYPE_UNSUPPORTED: "Jenis catatan belum didukung sinkronisasi",
  SYS_VALIDATION: "Data tidak lolos validasi server",
  RATE_LIMITED: "Terlalu banyak permintaan — coba lagi nanti",
  AUTH_EXPIRED: "Sesi berakhir — masuk kembali lalu sinkron ulang",
  RBAC_FORBIDDEN: "Akun tidak punya akses untuk catatan ini",
  NETWORK_ERROR: "Jaringan tidak tersedia"
});

export function describeOutboxError(error: OutboxError): string {
  return ERROR_LABELS[error.code] ?? `Ditolak server (${error.code})`;
}

export interface OutboxItemPresentation {
  readonly title: string;
  readonly moment: string;
}

export function describeOutboxItem(item: OutboxItem): OutboxItemPresentation {
  const moment = formatMoment(new Date(item.createdAt));
  if (item.tipe === "batch") {
    const weight = item.payload["weightKg"];
    return {
      title: typeof weight === "number" ? `Batch ${formatKg(weight, "manual")}` : "Batch",
      moment
    };
  }
  if (item.tipe === "ledger_event") {
    const type = item.payload["tipe"];
    return {
      title: typeof type === "string" ? `Catatan ${type}` : "Catatan ledger",
      moment
    };
  }
  return { title: "Observasi sisa", moment };
}