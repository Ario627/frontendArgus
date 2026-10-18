import type { AnomalyKind } from "@/shared/constants/anomaly.constant";
import { ANOMALY_KIND_LABELS } from "@/shared/constants/anomaly.constant";
import { formatPercent, formatNumber } from "@/shared/lib/format";

export interface AnomalyDetailLine {
  readonly label: string;
  readonly value: string;
}

export interface AnomalyItemView {
  readonly lines: readonly AnomalyDetailLine[];
}

export interface AnomalyClosedView {
  readonly catatan: string;
  readonly oleh: string | null;
  readonly at: string | null;
  readonly otomatis: boolean;
}

export interface AnomalyDetailView {
  readonly items: readonly AnomalyItemView[];
  readonly penutupan: AnomalyClosedView | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

const CHAIN_REASON_LABELS: Readonly<Record<string, string>> = Object.freeze({
  HASH_MISMATCH: "isi berubah dari catatan asli",
  PREV_LINK_MISMATCH: "hubungan dengan peristiwa sebelumnya terputus"
});

function itemLines(jenis: AnomalyKind, item: Record<string, unknown>): readonly AnomalyDetailLine[] {
  const lines: AnomalyDetailLine[] = [];
  if (jenis === "RANTAI_TIMPA") {
    const index = readNumber(item["index"]);
    const reason = readString(item["reason"]);
    const eventId = readString(item["eventId"]);
    if (index !== null) lines.push({ label: "Peristiwa ke-", value: String(index + 1) });
    if (reason !== null) {
      lines.push({ label: "Sebab", value: CHAIN_REASON_LABELS[reason] ?? reason });
    }
    if (eventId !== null) lines.push({ label: "Event", value: eventId.slice(0, 8) });
    return lines;
  }
  if (jenis === "NERACA_MASSA") {
    const delta = readNumber(item["deltaPercent"]);
    const received = readNumber(item["receivedKg"]);
    const min = readNumber(item["expectedMinKg"]);
    const max = readNumber(item["expectedMaxKg"]);
    if (delta !== null) lines.push({ label: "Selisih", value: formatPercent(delta, 1) });
    if (received !== null) lines.push({ label: "Diterima", value: `${formatNumber(received, 2)} kg` });
    if (min !== null && max !== null) {
      lines.push({ label: "Rentang wajar", value: `${formatNumber(min, 2)}–${formatNumber(max, 2)} kg` });
    }
    return lines;
  }
  if (jenis === "DURASI_UMUR") {
    const elapsed = readNumber(item["elapsedHours"]);
    const maxAge = readNumber(item["maxAgeHours"]);
    const lateBy = readNumber(item["lateByHours"]);
    if (elapsed !== null) lines.push({ label: "Umur berjalan", value: `${formatNumber(elapsed, 1)} jam` });
    if (maxAge !== null) lines.push({ label: "Batas fasilitas", value: `${formatNumber(maxAge, 0)} jam` });
    if (lateBy !== null) lines.push({ label: "Kelebihan", value: `${formatNumber(lateBy, 1)} jam` });
    return lines;
  }
  for (const [key, value] of Object.entries(item)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      lines.push({ label: key, value: formatNumber(value, 2) });
      continue;
    }
    if (typeof value === "string" && value.length > 0) {
      lines.push({ label: key, value });
    }
  }
  return lines;
}

function readItems(jenis: AnomalyKind, detail: Record<string, unknown>): readonly AnomalyItemView[] {
  const raw = detail["items"];
  if (!Array.isArray(raw)) return [];
  const items: AnomalyItemView[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    items.push({ lines: itemLines(jenis, entry) });
  }
  return items;
}

export function parseAnomalyDetail(
  jenis: AnomalyKind,
  detail: Record<string, unknown>
): AnomalyDetailView {
  const items = readItems(jenis, detail);
  const penutupanRaw = detail["penutupan"];
  let penutupan: AnomalyClosedView | null = null;
  if (isRecord(penutupanRaw)) {
    const catatan = readString(penutupanRaw["catatan"]);
    if (catatan !== null) {
      penutupan = {
        catatan,
        oleh: readString(penutupanRaw["oleh"]),
        at: readString(penutupanRaw["at"]),
        otomatis: penutupanRaw["otomatis"] === true
      };
    }
  }
  return { items, penutupan };
}

export function describeAnomalySummary(
  jenis: AnomalyKind,
  view: AnomalyDetailView
): string {
  if (view.items.length === 0) return "Tidak ada rincian tambahan.";
  if (view.items.length === 1) {
    const first = view.items[0];
    if (first === undefined || first.lines.length === 0) return "Tidak ada rincian tambahan.";
    return first.lines.map((line) => `${line.label} ${line.value}`).join(" · ");
  }
  return `${view.items.length} temuan pada ${ANOMALY_KIND_LABELS[jenis].toLowerCase()}`;
}
