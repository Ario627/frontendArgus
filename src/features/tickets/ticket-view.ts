import type { TicketStatus } from "@/shared/constants/ticket.constant";

export const AGE_WARNING_HOURS = 72;

const OPEN_STATUSES: ReadonlySet<TicketStatus> = new Set(["BARU", "DIVERIFIKASI", "DITANGGAPI"]);

export const STATUS_CHIP_CLASSES: Readonly<Record<TicketStatus, string>> = Object.freeze({
  BARU: "border-kunyit/50 text-kunyit",
  DIVERIFIKASI: "border-biru-tinta/40 text-biru-tinta",
  DITANGGAPI: "border-daun/40 text-daun",
  SELESAI: "border-garis text-ink-lemah",
  DITOLAK_MODERASI: "border-bata/40 text-bata"
});

export interface RiskBreakdownView {
  readonly components: readonly { readonly label: string; readonly value: number }[];
  readonly total: number;
}

const RISK_COMPONENT_LABELS: Readonly<Record<string, string>> = Object.freeze({
  dasar: "Dasar",
  jenis: "Jenis",
  anomali: "Anomali 72 jam",
  tersangkut: "Tersangkut 72 jam",
  foto: "Foto"
});

export function isOpenTicketStatus(status: TicketStatus): boolean {
  return OPEN_STATUSES.has(status);
}

export function ageHoursOf(createdAt: string, now: Date = new Date()): number {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return 0;
  return Math.max(0, (now.getTime() - created) / 3_600_000);
}

export function parseRiskBreakdown(catatan: string | null): RiskBreakdownView | null {
  if (catatan === null || catatan.trim() === "") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(catatan);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  const components: { label: string; value: number }[] = [];
  let total = 0;
  for (const [key, label] of Object.entries(RISK_COMPONENT_LABELS)) {
    const value = record[key];
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    components.push({ label, value });
    total += value;
  }
  return { components, total: Math.min(100, total) };
}