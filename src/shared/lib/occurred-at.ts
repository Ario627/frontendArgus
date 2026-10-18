export const OCCURRED_AT_MODES = Object.freeze(["now", "min30", "hour1", "custom"] as const);

export type OccurredAtMode = (typeof OCCURRED_AT_MODES)[number];

export const OCCURRED_AT_MODE_LABELS: Readonly<Record<OccurredAtMode, string>> = Object.freeze({
  now: "Baru saja",
  min30: "±30 mnt",
  hour1: "±1 jam",
  custom: "Lainnya"
});

const MODE_OFFSETS_MS: Readonly<Record<Exclude<OccurredAtMode, "custom">, number>> = Object.freeze({
  now: 0,
  min30: 30 * 60 * 1000,
  hour1: 60 * 60 * 1000
});

const MODE_TOLERANCE_MS = 90 * 1000;

export function occurredAtIsoFor(mode: Exclude<OccurredAtMode, "custom">): string {
  return new Date(Date.now() - MODE_OFFSETS_MS[mode]).toISOString();
}

export function inferOccurredAtMode(iso: string): OccurredAtMode {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "custom";
  const age = Date.now() - time;
  if (Math.abs(age - MODE_OFFSETS_MS.now) <= MODE_TOLERANCE_MS) return "now";
  if (Math.abs(age - MODE_OFFSETS_MS.min30) <= MODE_TOLERANCE_MS) return "min30";
  if (Math.abs(age - MODE_OFFSETS_MS.hour1) <= MODE_TOLERANCE_MS) return "hour1";
  return "custom";
}

export function isoToLocalInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}