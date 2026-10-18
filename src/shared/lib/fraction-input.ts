import {
  FRACTION_CODES,
  isFractionCode,
  type FractionCode,
  type FractionValues
} from "@/shared/constants/fraction.constant";

export const DOMINANT_PERCENT = 60;
export const EXTRA_PERCENT = 15;

const PERCENT_INPUT_PATTERN = /^\d{1,3}(?:[.,]\d{1,2})?$/;

export function parsePercent(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!PERCENT_INPUT_PATTERN.test(normalized)) return null;
  const value = Number(normalized);
  return value <= 100 ? value : null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface QuickPick {
  readonly dominant: string;
  readonly extras: readonly string[];
}

export function fractionsFromQuick(pick: QuickPick): FractionValues {
  if (!isFractionCode(pick.dominant)) return {};
  const fractions: FractionValues = { [pick.dominant]: DOMINANT_PERCENT };
  const extras = pick.extras.filter(isFractionCode).filter((code) => code !== pick.dominant);
  if (extras.length === 0) return fractions;
  const budget = 100 - DOMINANT_PERCENT;
  const share = Math.min(EXTRA_PERCENT, Math.floor((budget / extras.length) * 100) / 100);
  let used = DOMINANT_PERCENT;
  for (const code of extras) {
    const assigned = round2(Math.min(share, 100 - used));
    if (assigned <= 0) break;
    fractions[code] = assigned;
    used = round2(used + assigned);
  }
  return fractions;
}

export type FractionBuildReason = "NEED_DOMINANT" | "RINCI_INVALID" | "RINCI_EMPTY" | "RINCI_OVER";

export type FractionBuildResult =
  | { readonly ok: true; readonly fractions: FractionValues }
  | { readonly ok: false; readonly reason: FractionBuildReason; readonly field?: FractionCode };

export interface FractionFormState {
  readonly rinciEnabled: boolean;
  readonly rinci: Readonly<Record<string, string>>;
  readonly dominant: string;
  readonly extras: readonly string[];
}

export function buildFractionsFromForm(state: FractionFormState): FractionBuildResult {
  if (!state.rinciEnabled) {
    const quick = fractionsFromQuick({ dominant: state.dominant, extras: state.extras });
    if (Object.keys(quick).length === 0) return { ok: false, reason: "NEED_DOMINANT" };
    return { ok: true, fractions: quick };
  }

  const fractions: FractionValues = {};
  let invalidField: FractionCode | undefined;
  let total = 0;

  for (const code of FRACTION_CODES) {
    const raw = state.rinci[code]?.trim() ?? "";
    if (raw === "") continue;
    const parsed = parsePercent(raw);
    if (parsed === null) {
      invalidField = code;
      break;
    }
    if (parsed > 0) {
      fractions[code] = parsed;
      total = round2(total + parsed);
    }
  }

  if (invalidField !== undefined) return { ok: false, reason: "RINCI_INVALID", field: invalidField };
  if (total > 100) return { ok: false, reason: "RINCI_OVER" };
  if (Object.keys(fractions).length === 0) return { ok: false, reason: "RINCI_EMPTY" };
  return { ok: true, fractions };
}