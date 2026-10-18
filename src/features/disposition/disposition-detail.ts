import { isDispositionTier, type DispositionTier } from "@/shared/constants/tier.constant";

export type CandidateTier = Exclude<DispositionTier, "T0">;

export interface CandidateBreakdownView {
  readonly cost: number;
  readonly value: number;
  readonly risk: number;
}

export interface CandidateScoreView {
  readonly facilityId: string;
  readonly nama: string;
  readonly tier: CandidateTier;
  readonly eligible: boolean;
  readonly ineligibility: string | null;
  readonly score: number | null;
  readonly breakdown: CandidateBreakdownView | null;
  readonly notes: readonly string[];
}

export interface DispositionParametersView {
  readonly biayaPerKm: number | null;
  readonly faktorMuat: number | null;
  readonly biayaTolak: number | null;
  readonly penaltiUmurPerJam: number | null;
  readonly kecepatanKotaJam: number | null;
  readonly assumedSpeed: boolean;
}

export interface DispositionDetailView {
  readonly chosenTier: DispositionTier | null;
  readonly chosenFacilityId: string | null;
  readonly chosenFacilityNama: string | null;
  readonly reason: string | null;
  readonly assumedSpeed: boolean;
  readonly candidates: readonly CandidateScoreView[];
  readonly parameters: DispositionParametersView | null;
  readonly missingParameters: readonly string[];
  readonly decidedAt: string | null;
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

function readStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function readCandidateTier(value: unknown): CandidateTier | null {
  if (!isDispositionTier(value) || value === "T0") return null;
  return value;
}

function readBreakdown(value: unknown): CandidateBreakdownView | null {
  if (!isRecord(value)) return null;
  const cost = readNumber(value["cost"]);
  const valuePart = readNumber(value["value"]);
  const risk = readNumber(value["risk"]);
  if (cost === null || valuePart === null || risk === null) return null;
  return { cost, value: valuePart, risk };
}

function readCandidate(value: unknown): CandidateScoreView | null {
  if (!isRecord(value)) return null;
  const facilityId = readString(value["facilityId"]);
  const nama = readString(value["nama"]);
  const tier = readCandidateTier(value["tier"]);
  if (facilityId === null || nama === null || tier === null) return null;
  return {
    facilityId,
    nama,
    tier,
    eligible: value["eligible"] === true,
    ineligibility: readString(value["reason"]),
    score: readNumber(value["score"]),
    breakdown: readBreakdown(value["breakdown"]),
    notes: readStringArray(value["notes"])
  };
}

function readCandidates(value: unknown): readonly CandidateScoreView[] {
  if (!Array.isArray(value)) return [];
  const candidates: CandidateScoreView[] = [];
  for (const entry of value) {
    const candidate = readCandidate(entry);
    if (candidate !== null) candidates.push(candidate);
  }
  return candidates;
}

function readParameters(value: unknown): DispositionParametersView | null {
  if (!isRecord(value)) return null;
  return {
    biayaPerKm: readNumber(value["biayaPerKm"]),
    faktorMuat: readNumber(value["faktorMuat"]),
    biayaTolak: readNumber(value["biayaTolak"]),
    penaltiUmurPerJam: readNumber(value["penaltiUmurPerJam"]),
    kecepatanKotaJam: readNumber(value["kecepatanKotaJam"]),
    assumedSpeed: value["assumedSpeed"] === true
  };
}

export function parseDispositionDetail(raw: unknown): DispositionDetailView | null {
  if (!isRecord(raw)) return null;
  const chosenTier = raw["chosenTier"];
  return {
    chosenTier: isDispositionTier(chosenTier) ? chosenTier : null,
    chosenFacilityId: readString(raw["chosenFacilityId"]),
    chosenFacilityNama: readString(raw["chosenFacilityNama"]),
    reason: readString(raw["reason"]),
    assumedSpeed: raw["assumedSpeed"] === true,
    candidates: readCandidates(raw["candidates"]),
    parameters: readParameters(raw["parameters"]),
    missingParameters: readStringArray(raw["missingParameters"]),
    decidedAt: readString(raw["decidedAt"])
  };
}