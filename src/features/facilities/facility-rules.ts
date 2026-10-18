import { FRACTION_LABELS, isFractionCode } from "@/shared/constants/fraction.constant";
import { FLOW_LABELS, isWasteFlow } from "@/shared/constants/flow.constant";
import { formatNumber, formatRupiah } from "@/shared/lib/format";

export interface RuleLine {
  readonly label: string;
  readonly value: string;
}

const OIL_POLICY_LABELS: Readonly<Record<string, string>> = Object.freeze({
  fix: "minta perbaiki",
  reject: "tolak",
  allow: "boleh diterima"
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readFractionCodes(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  const labels: string[] = [];
  for (const entry of value) {
    if (isFractionCode(entry)) labels.push(`${entry} ${FRACTION_LABELS[entry]}`);
  }
  return labels;
}

function readFlows(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  const labels: string[] = [];
  for (const entry of value) {
    if (isWasteFlow(entry)) labels.push(FLOW_LABELS[entry]);
  }
  return labels;
}

export function buildProfileRuleLines(rules: Record<string, unknown>): readonly RuleLine[] {
  const lines: RuleLine[] = [];

  const flows = readFlows(rules["acceptsFlows"]);
  if (flows.length > 0) lines.push({ label: "Aliran diterima", value: flows.join(", ") });

  const fractions = readFractionCodes(rules["acceptsFractions"]);
  if (fractions.length > 0) {
    lines.push({ label: "Fraksi diterima", value: fractions.join(", ") });
  } else if (Array.isArray(rules["acceptsFractions"]) && rules["acceptsFractions"].length === 0) {
    lines.push({ label: "Fraksi diterima", value: "Tidak ada pembatasan fraksi" });
  }

  const moisture = rules["moisture"];
  if (isRecord(moisture)) {
    const passMin = readNumber(moisture["passMin"]);
    const passMax = readNumber(moisture["passMax"]);
    const fixAbove = readNumber(moisture["fixAbove"]);
    const rejectAbove = readNumber(moisture["rejectAbove"]);
    if (passMin !== null && passMax !== null) {
      lines.push({ label: "Kadar air lolos", value: `${formatNumber(passMin, 0)}–${formatNumber(passMax, 0)}` });
    }
    if (fixAbove !== null) lines.push({ label: "Perbaiki di atas", value: formatNumber(fixAbove, 0) });
    if (rejectAbove !== null) lines.push({ label: "Tolak di atas", value: formatNumber(rejectAbove, 0) });
  }

  const maxAgeHours = readNumber(rules["maxAgeHours"]);
  if (maxAgeHours !== null) lines.push({ label: "Umur maksimum", value: `${formatNumber(maxAgeHours, 0)} jam` });

  const contaminant = rules["contaminant"];
  if (isRecord(contaminant)) {
    const plasticMax = readNumber(contaminant["plasticPercentMax"]);
    const oilPolicy = readString(contaminant["visibleOil"]);
    if (plasticMax !== null) {
      lines.push({ label: "Plastik maksimum", value: `${formatNumber(plasticMax, 0)}%` });
    }
    if (oilPolicy !== null) {
      lines.push({ label: "Berminyak terlihat", value: OIL_POLICY_LABELS[oilPolicy] ?? oilPolicy });
    }
  }

  const capacity = readNumber(rules["capacityKgPerDay"]);
  if (capacity !== null) lines.push({ label: "Kapasitas harian", value: `${formatNumber(capacity, 0)} kg/hari` });

  const operatingHours = readString(rules["operatingHours"]);
  if (operatingHours !== null) lines.push({ label: "Jam operasi", value: operatingHours });

  const pricePerKg = readNumber(rules["pricePerKg"]);
  if (pricePerKg !== null) lines.push({ label: "Harga per kg", value: formatRupiah(pricePerKg) });

  return lines;
}
