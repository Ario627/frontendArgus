import { ANOMALY_SEVERITY_LABELS } from "@/shared/constants/anomaly.constant";
import { formatKgValue, formatNumber, formatPercent } from "@/shared/lib/format";
import type { VerificationReport } from "@/shared/types/ledger.types";
import {
  describeAnomaly,
  describeChainReason,
  describeTransfer
} from "@/features/ledger/ledger-format";

export function buildVerifyReportText(report: VerificationReport): string {
  const lines: string[] = ["ARGUS — laporan verifikasi ledger", `Batch: ${report.batchId}`];
  if (report.chainOk) {
    lines.push(`Rantai: utuh (${report.eventsChecked} peristiwa)`);
  } else if (report.chainIssue !== null) {
    lines.push(
      `Rantai: TIMPA pada peristiwa ke-${report.chainIssue.index + 1} — ${describeChainReason(report.chainIssue.reason)}`
    );
  } else {
    lines.push("Rantai: timpa terdeteksi");
  }
  lines.push(`Serah terima: ${describeTransfer(report.transfer)}`);
  const balance = report.massBalance;
  if (balance !== null) {
    lines.push(
      `Neraca massa: ${formatKgValue(balance.receivedKg)} kg dari ${formatKgValue(balance.handedOverKg)} kg ` +
        `(wajar ${formatKgValue(balance.expectedMinKg)}–${formatKgValue(balance.expectedMaxKg)} kg) ` +
        `selisih ${formatPercent(balance.deltaPercent, 1)}`
    );
    lines.push(
      `Parameter: susut wajar ${formatNumber(balance.parameter.susutWajar * 100, 1)}% ` +
        `(${balance.parameter.susutWajarSumber}), toleransi ${formatNumber(balance.parameter.toleransi * 100, 1)}% ` +
        `(${balance.parameter.toleransiSumber})`
    );
  }
  if (report.spoilage.elapsedHours !== null) {
    const limit =
      report.spoilage.maxAgeHours === null ? "tanpa batas" : `${formatNumber(report.spoilage.maxAgeHours, 0)}j`;
    lines.push(
      `Umur: ${formatNumber(report.spoilage.elapsedHours, 1)}j (batas ${limit})` +
        (report.spoilage.late === true ? " — melewati batas" : "")
    );
  }
  for (const anomaly of report.anomalies) {
    const extra = describeAnomaly(anomaly);
    lines.push(`Anomali: ${anomaly.jenis} (${ANOMALY_SEVERITY_LABELS[anomaly.tingkat]})${extra === "" ? "" : ` — ${extra}`}`);
  }
  lines.push("Diverifikasi dari aplikasi ARGUS.");
  return lines.join("\n");
}