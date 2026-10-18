import { ANOMALY_KIND_LABELS } from "@/shared/constants/anomaly.constant";
import { formatKgValue, formatNumber, formatPercent } from "@/shared/lib/format";
import type {
  AnomalyReport,
  ChainIssueReport,
  TransferEvaluation
} from "@/shared/types/ledger.types";

const PARAMETER_SOURCE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  literatur: "literatur",
  kalibrasi_pilot: "kalibrasi pilot",
  manual_admin: "manual admin",
  belum_ada: "belum ada"
});

export function describeParameterSource(source: string): string {
  return PARAMETER_SOURCE_LABELS[source] ?? source;
}

export function readTransferSide(payload: Record<string, unknown>): "KIRIM" | "TERIMA" | null {
  const data = payload["data"];
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
  const sisi = (data as Record<string, unknown>)["sisi"];
  return sisi === "KIRIM" || sisi === "TERIMA" ? sisi : null;
}

export function describeChainReason(reason: ChainIssueReport["reason"]): string {
  return reason === "HASH_MISMATCH"
    ? "isi berubah dari catatan asli"
    : "hubungan dengan peristiwa sebelumnya terputus";
}

export function describeTransfer(transfer: TransferEvaluation): string {
  if (transfer.status === null) return "Belum ada serah terima";
  if (transfer.status === "MENUNGGU_KONFIRMASI") return "Menunggu konfirmasi saksi kedua";
  const parts: string[] = [];
  if (transfer.senderKg !== null) parts.push(`kirim ${formatKgValue(transfer.senderKg)} kg`);
  if (transfer.receiverKg !== null) parts.push(`terima ${formatKgValue(transfer.receiverKg)} kg`);
  if (transfer.diffKg !== null) parts.push(`selisih ${formatKgValue(Math.abs(transfer.diffKg))} kg`);
  return `Sah — ${parts.join(", ")}`;
}

export function describeAnomaly(report: AnomalyReport): string {
  const detail = report.detail;
  if (report.jenis === "NERACA_MASSA") {
    const delta = detail["deltaPercent"];
    return typeof delta === "number" ? `Selisih ${formatPercent(delta, 1)}` : "";
  }
  if (report.jenis === "DURASI_UMUR") {
    const elapsed = detail["elapsedHours"];
    return typeof elapsed === "number" ? `Berjalan ${formatNumber(elapsed, 1)}j` : "";
  }
  return ANOMALY_KIND_LABELS[report.jenis];
}