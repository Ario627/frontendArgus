export const EMPTY_CELL = "—";

export type KgSource = "manual" | "device";

export const KG_DIGITS = Object.freeze({ manual: 1, device: 2 } satisfies Record<KgSource, number>);

const NBSP = "\u00a0";
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const KG_INPUT_PATTERN = /^\d{1,5}(?:[.,]\d{1,2})?$/;

const numberFormatters = new Map<string, Intl.NumberFormat>();
const percentFormatters = new Map<number, Intl.NumberFormat>();
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});
const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
const timeFormatter = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const dayMonthFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

function numberFormatter(min: number, max: number): Intl.NumberFormat {
  const key = `${min}:${max}`;
  const cached = numberFormatters.get(key);
  if (cached) return cached;
  const created = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: min,
    maximumFractionDigits: max
  });
  numberFormatters.set(key, created);
  return created;
}

function percentFormatter(digits: number): Intl.NumberFormat {
  const cached = percentFormatters.get(digits);
  if (cached) return cached;
  const created = new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  percentFormatters.set(digits, created);
  return created;
}

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateOnlyToLocal(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return EMPTY_CELL;
  return numberFormatter(digits, digits).format(value);
}

export function formatInt(value: number): string {
  return formatNumber(value, 0);
}

export function formatKgValue(value: number, source: KgSource = "manual"): string {
  if (!Number.isFinite(value)) return EMPTY_CELL;
  const digits = KG_DIGITS[source];
  return numberFormatter(digits, digits).format(value);
}

export function formatKg(value: number, source: KgSource = "manual"): string {
  const formatted = formatKgValue(value, source);
  return formatted === EMPTY_CELL ? EMPTY_CELL : `${formatted}${NBSP}kg`;
}

export function formatRupiah(value: number): string {
  if (!Number.isFinite(value)) return EMPTY_CELL;
  return rupiahFormatter.format(value);
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return EMPTY_CELL;
  return percentFormatter(digits).format(value / 100);
}

export function formatDateOnly(value: string): string {
  const date = dateOnlyToLocal(value);
  return date ? dateFormatter.format(date) : EMPTY_CELL;
}

export function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : EMPTY_CELL;
}

export function formatDate(value: string | Date): string {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : EMPTY_CELL;
}

export function formatTime(value: string | Date): string {
  const date = toDate(value);
  return date ? timeFormatter.format(date) : EMPTY_CELL;
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return EMPTY_CELL;
  if (ms < MINUTE_MS) return "baru saja";
  const totalMinutes = Math.floor(ms / MINUTE_MS);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}j ${String(minutes).padStart(2, "0")}m`;
}

export function formatMoment(value: string | Date, now: Date = new Date()): string {
  const date = toDate(value);
  if (!date) return EMPTY_CELL;
  const delta = now.getTime() - date.getTime();
  if (delta >= 0 && delta < MINUTE_MS) return "baru saja";
  if (delta >= MINUTE_MS && delta < HOUR_MS) return `${Math.floor(delta / MINUTE_MS)} menit lalu`;
  if (date.toDateString() === now.toDateString()) return timeFormatter.format(date);
  if (date.getFullYear() === now.getFullYear()) {
    return `${dayMonthFormatter.format(date)}, ${timeFormatter.format(date)}`;
  }
  return dateTimeFormatter.format(date);
}

export function parseKg(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!KG_INPUT_PATTERN.test(normalized)) return null;
  return Number(normalized);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return EMPTY_CELL;
  if (bytes < 1024) return `${Math.round(bytes)}${NBSP}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${formatNumber(kb, kb < 10 ? 1 : 0)}${NBSP}KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${formatNumber(mb, mb < 10 ? 1 : 0)}${NBSP}MB`;
  return `${formatNumber(mb / 1024, 1)}${NBSP}GB`;
}

export function nowIso(): string {
  return new Date().toISOString();
}