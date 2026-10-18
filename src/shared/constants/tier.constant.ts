export const DISPOSITION_TIERS = Object.freeze(["T0", "T1", "T2", "T3", "T4"] as const);

export type DispositionTier = (typeof DISPOSITION_TIERS)[number];

export const TIER_LABELS: Readonly<Record<DispositionTier, string>> = Object.freeze({
  T0: "Cegah di sumber",
  T1: "Olah di dapur",
  T2: "Hub kluster",
  T3: "Fasilitas pusat",
  T4: "Fallback tercatat"
});

const TIER_SET: ReadonlySet<string> = new Set(DISPOSITION_TIERS);

export function isDispositionTier(value: unknown): value is DispositionTier {
  return typeof value === "string" && TIER_SET.has(value);
}