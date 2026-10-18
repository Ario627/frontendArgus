export const FRACTION_CODES = Object.freeze(["A", "B", "C", "D", "E"] as const);

export type FractionCode = (typeof FRACTION_CODES)[number];

export type FractionTone = "fraksi-a" | "fraksi-b" | "fraksi-c" | "fraksi-d" | "fraksi-e";

export type FractionValues = Partial<Record<FractionCode, number>>;

export const FRACTION_LABELS: Readonly<Record<FractionCode, string>> = Object.freeze({
  A: "Daun & sayur",
  B: "Nasi & lauk",
  C: "Berkuah/berminyak",
  D: "Kulit keras",
  E: "Plastik/kontaminan"
});

export const FRACTION_TONES: Readonly<Record<FractionCode, FractionTone>> = Object.freeze({
  A: "fraksi-a",
  B: "fraksi-b",
  C: "fraksi-c",
  D: "fraksi-d",
  E: "fraksi-e"
});

const FRACTION_SET: ReadonlySet<string> = new Set(FRACTION_CODES);

export function isFractionCode(value: unknown): value is FractionCode {
  return typeof value === "string" && FRACTION_SET.has(value);
}

export function sumFractions(values: FractionValues): number {
  let total = 0;
  for (const code of FRACTION_CODES) {
    total += values[code] ?? 0;
  }
  return total;
}

export function remainingFraction(values: FractionValues): number {
  return Math.max(0, 100 - sumFractions(values));
}