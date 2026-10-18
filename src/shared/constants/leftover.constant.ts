export const LEFTOVER_SCALE = Object.freeze([0, 1, 2, 3, 4] as const);

export type LeftoverLevel = (typeof LEFTOVER_SCALE)[number];

export const LEFTOVER_LABELS: Readonly<Record<LeftoverLevel, string>> =
  Object.freeze({
    0: "Habis",
    1: "Sisa sedikit",
    2: "Separuh",
    3: "Sisa banyak",
    4: "Hampir penuh",
  });

export const LEFTOVER_SAMPLE_MIN = 30;

const LEFTOVER_SET: ReadonlySet<number> = new Set(LEFTOVER_SCALE);

export function isLeftoverLevel(value: unknown): value is LeftoverLevel {
  return typeof value === "number" && LEFTOVER_SET.has(value);
}
