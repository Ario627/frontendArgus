import { isGateStatus, type GateStatus } from "@/shared/constants/gate.constant";

export interface GateFindingView {
  readonly rule: string;
  readonly detail: string;
}

export interface GateDetailView {
  readonly status: GateStatus | null;
  readonly fixes: readonly string[];
  readonly violations: readonly GateFindingView[];
  readonly notes: readonly GateFindingView[];
  readonly usedDefaultProfile: boolean;
  readonly ageHours: number | null;
  readonly evaluatedAt: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function readFindings(value: unknown): readonly GateFindingView[] {
  if (!Array.isArray(value)) return [];
  const findings: GateFindingView[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const rule = entry["rule"];
    const detail = entry["detail"];
    if (typeof rule !== "string" || typeof detail !== "string") continue;
    findings.push({ rule, detail });
  }
  return findings;
}

export function readGateDetail(raw: unknown): GateDetailView | null {
  if (!isRecord(raw)) return null;
  const status = raw["status"];
  const ageHours = raw["ageHours"];
  const evaluatedAt = raw["evaluatedAt"];
  return {
    status: isGateStatus(status) ? status : null,
    fixes: readStringArray(raw["fixes"]),
    violations: readFindings(raw["violations"]),
    notes: readFindings(raw["notes"]),
    usedDefaultProfile: raw["usedDefaultProfile"] === true,
    ageHours: typeof ageHours === "number" && Number.isFinite(ageHours) ? ageHours : null,
    evaluatedAt: typeof evaluatedAt === "string" ? evaluatedAt : null
  };
}