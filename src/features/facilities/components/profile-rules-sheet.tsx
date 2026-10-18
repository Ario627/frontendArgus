import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useSaveFacilityProfile } from "@/features/facilities/hooks/use-facility-mutations";
import { Button } from "@/shared/components/ui/button";
import { ChipButton } from "@/shared/components/ui/chip";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { FRACTION_CODES, FRACTION_LABELS } from "@/shared/constants/fraction.constant";
import { FLOW_LABELS, WASTE_FLOWS } from "@/shared/constants/flow.constant";
import type {
  AcceptanceProfileRules,
  FacilityDto,
  VisibleOilPolicy
} from "@/shared/types/facility.types";
import type { FractionCode } from "@/shared/constants/fraction.constant";
import type { WasteFlow } from "@/shared/constants/flow.constant";

const PERCENT_FIELDS = ["passMin", "passMax", "fixAbove", "rejectAbove"] as const;
type PercentField = (typeof PERCENT_FIELDS)[number];

const PERCENT_LABELS: Readonly<Record<PercentField, string>> = Object.freeze({
  passMin: "Lolos: batas bawah (%)",
  passMax: "Lolos: batas atas (%)",
  fixAbove: "Perbaiki mulai di atas (%)",
  rejectAbove: "Tolak mulai di atas (%)"
});

interface FormState {
  readonly acceptsFractions: readonly FractionCode[];
  readonly acceptsFlows: readonly WasteFlow[];
  readonly moisture: Readonly<Record<PercentField, string>>;
  readonly maxAgeHours: string;
  readonly plasticPercentMax: string;
  readonly visibleOil: VisibleOilPolicy;
  readonly capacityKgPerDay: string;
  readonly operatingHours: string;
  readonly pricePerKg: string;
}

const DEFAULT_STATE: FormState = Object.freeze({
  acceptsFractions: ["A", "B", "C"] as readonly FractionCode[],
  acceptsFlows: ["organik"] as readonly WasteFlow[],
  moisture: { passMin: "", passMax: "", fixAbove: "", rejectAbove: "" },
  maxAgeHours: "",
  plasticPercentMax: "",
  visibleOil: "fix",
  capacityKgPerDay: "",
  operatingHours: "",
  pricePerKg: ""
});

const readRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const readNumberText = (value: unknown): string =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

const readFractions = (value: unknown): readonly FractionCode[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is FractionCode =>
        typeof entry === "string" && (FRACTION_CODES as readonly string[]).includes(entry)
      )
    : DEFAULT_STATE.acceptsFractions;

const readFlows = (value: unknown): readonly WasteFlow[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is WasteFlow =>
        typeof entry === "string" && (WASTE_FLOWS as readonly string[]).includes(entry)
      )
    : DEFAULT_STATE.acceptsFlows;

const fromRules = (rules: Record<string, unknown> | null): FormState => {
  if (rules === null) return DEFAULT_STATE;
  const moisture = readRecord(rules["moisture"]);
  const contaminant = readRecord(rules["contaminant"]);
  const oil = contaminant?.["visibleOil"];
  return {
    acceptsFractions: readFractions(rules["acceptsFractions"]),
    acceptsFlows: readFlows(rules["acceptsFlows"]),
    moisture: {
      passMin: readNumberText(moisture?.["passMin"]),
      passMax: readNumberText(moisture?.["passMax"]),
      fixAbove: readNumberText(moisture?.["fixAbove"]),
      rejectAbove: readNumberText(moisture?.["rejectAbove"])
    },
    maxAgeHours: readNumberText(rules["maxAgeHours"]),
    plasticPercentMax: readNumberText(contaminant?.["plasticPercentMax"]),
    visibleOil: oil === "reject" || oil === "allow" ? oil : "fix",
    capacityKgPerDay: readNumberText(rules["capacityKgPerDay"]),
    operatingHours: typeof rules["operatingHours"] === "string" ? rules["operatingHours"] : "",
    pricePerKg: readNumberText(rules["pricePerKg"])
  };
};

const parsePercent = (raw: string): { readonly ok: boolean; readonly value: number | null } => {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return { ok: false, value: null };
  return { ok: true, value: parsed };
};

const parsePositive = (raw: string): { readonly ok: boolean; readonly value: number | null } => {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return { ok: false, value: null };
  return { ok: true, value: parsed };
};

export interface ProfileRulesSheetProps {
  readonly facility: FacilityDto | null;
  readonly rules: Record<string, unknown> | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function ProfileRulesSheet({ facility, rules, open, onOpenChange }: ProfileRulesSheetProps) {
  const save = useSaveFacilityProfile();
  const showToast = useToastStore((state) => state.show);
  const [state, setState] = useState<FormState>(DEFAULT_STATE);
  const [error, setError] = useState<string | null>(null);
  const [loadedForOpen, setLoadedForOpen] = useState(false);

  if (open !== loadedForOpen) {
    setLoadedForOpen(open);
    if (open) {
      setState(fromRules(rules));
      setError(null);
    }
  }

  const patch = (partial: Partial<FormState>) => setState((current) => ({ ...current, ...partial }));

  const toggleFraction = (code: FractionCode) => {
    setState((current) => ({
      ...current,
      acceptsFractions: current.acceptsFractions.includes(code)
        ? current.acceptsFractions.filter((entry) => entry !== code)
        : [...current.acceptsFractions, code]
    }));
  };

  const toggleFlow = (flow: WasteFlow) => {
    setState((current) => ({
      ...current,
      acceptsFlows: current.acceptsFlows.includes(flow)
        ? current.acceptsFlows.filter((entry) => entry !== flow)
        : [...current.acceptsFlows, flow]
    }));
  };

  const submit = () => {
    if (facility === null) return;
    if (state.acceptsFractions.length === 0) {
      setError("Pilih minimal satu fraksi yang diterima.");
      return;
    }
    if (state.acceptsFlows.length === 0) {
      setError("Pilih minimal satu aliran yang diterima.");
      return;
    }

    const moisture: Record<PercentField, number | null> = {
      passMin: null,
      passMax: null,
      fixAbove: null,
      rejectAbove: null
    };
    for (const field of PERCENT_FIELDS) {
      const parsed = parsePercent(state.moisture[field]);
      if (!parsed.ok) {
        setError(`${PERCENT_LABELS[field]} harus angka 0-100 atau kosong.`);
        return;
      }
      moisture[field] = parsed.value;
    }

    const plastic = parsePercent(state.plasticPercentMax);
    if (!plastic.ok) {
      setError("Batas plastik harus angka 0-100 atau kosong.");
      return;
    }
    if (state.operatingHours !== "" && !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(state.operatingHours)) {
      setError("Jam operasi harus berformat HH:MM-HH:MM.");
      return;
    }

    const maxAge = parsePositive(state.maxAgeHours);
    const capacity = parsePositive(state.capacityKgPerDay);
    const price = parsePositive(state.pricePerKg);
    if (!maxAge.ok || !capacity.ok || !price.ok) {
      setError("Umur maksimum, kapasitas harian, dan harga harus angka positif atau kosong.");
      return;
    }

    const payload: AcceptanceProfileRules = {
      acceptsFractions: state.acceptsFractions,
      acceptsFlows: state.acceptsFlows,
      moisture: {
        passMin: moisture.passMin,
        passMax: moisture.passMax,
        fixAbove: moisture.fixAbove,
        rejectAbove: moisture.rejectAbove
      },
      maxAgeHours: maxAge.value,
      contaminant: { plasticPercentMax: plastic.value, visibleOil: state.visibleOil },
      capacityKgPerDay: capacity.value,
      operatingHours: state.operatingHours === "" ? null : state.operatingHours,
      pricePerKg: price.value
    };

    setError(null);
    save.mutate(
      { facilityId: facility.id, rules: payload },
      {
        onSuccess: (profile) => {
          showToast({ message: `Profil versi ${profile.version} berlaku sekarang.` });
          onOpenChange(false);
        },
        onError: (cause) => {
          setError(isApiError(cause) ? cause.message : "Profil tidak dapat disimpan.");
        }
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Profil penerimaan"
      description={
        facility === null
          ? ""
          : `Versi baru untuk ${facility.nama}. Versi lama otomatis berakhir.`
      }
      footer={
        <Button fullWidth loading={save.isPending} onClick={submit}>
          Simpan versi baru
        </Button>
      }
    >
      {error === null ? null : (
        <p role="alert" className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">Fraksi yang diterima</p>
          <div className="flex flex-wrap gap-2">
            {FRACTION_CODES.map((code) => (
              <ChipButton
                key={code}
                selected={state.acceptsFractions.includes(code)}
                title={FRACTION_LABELS[code]}
                onClick={() => toggleFraction(code)}
              >
                {code}
              </ChipButton>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">Aliran yang diterima</p>
          <div className="flex flex-wrap gap-2">
            {WASTE_FLOWS.map((flow) => (
              <ChipButton
                key={flow}
                selected={state.acceptsFlows.includes(flow)}
                onClick={() => toggleFlow(flow)}
              >
                {FLOW_LABELS[flow]}
              </ChipButton>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink">Ambang kadar air</p>
          <div className="grid grid-cols-2 gap-3">
            {PERCENT_FIELDS.map((field) => (
              <Field key={field} label={PERCENT_LABELS[field]} hint="Kosongkan bila tidak dipakai.">
                {(control) => (
                  <Input
                    id={control.id}
                    value={state.moisture[field]}
                    inputMode="decimal"
                    className="font-mono"
                    onChange={(event) =>
                      patch({ moisture: { ...state.moisture, [field]: event.target.value } })
                    }
                  />
                )}
              </Field>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink">Kontaminan</p>
          <Field label="Batas plastik (%)" hint="Kosongkan bila tidak dipakai.">
            {(control) => (
              <Input
                id={control.id}
                value={state.plasticPercentMax}
                inputMode="decimal"
                className="font-mono"
                onChange={(event) => patch({ plasticPercentMax: event.target.value })}
              />
            )}
          </Field>
          <Field label="Kebijakan minyak terlihat">
            {(control) => (
              <Select
                id={control.id}
                value={state.visibleOil}
                onChange={(event) => patch({ visibleOil: event.target.value as VisibleOilPolicy })}
              >
                <option value="fix">Perbaiki dulu</option>
                <option value="reject">Tolak</option>
                <option value="allow">Terima apa adanya</option>
              </Select>
            )}
          </Field>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink">Batas operasional</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Umur maksimum (jam)">
              {(control) => (
                <Input
                  id={control.id}
                  value={state.maxAgeHours}
                  inputMode="decimal"
                  className="font-mono"
                  onChange={(event) => patch({ maxAgeHours: event.target.value })}
                />
              )}
            </Field>
            <Field label="Kapasitas harian (kg)">
              {(control) => (
                <Input
                  id={control.id}
                  value={state.capacityKgPerDay}
                  inputMode="decimal"
                  className="font-mono"
                  onChange={(event) => patch({ capacityKgPerDay: event.target.value })}
                />
              )}
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jam operasi" hint="HH:MM-HH:MM">
              {(control) => (
                <Input
                  id={control.id}
                  value={state.operatingHours}
                  className="font-mono"
                  placeholder="08:00-16:00"
                  onChange={(event) => patch({ operatingHours: event.target.value })}
                />
              )}
            </Field>
            <Field label="Harga per kg (Rp)">
              {(control) => (
                <Input
                  id={control.id}
                  value={state.pricePerKg}
                  inputMode="decimal"
                  className="font-mono"
                  onChange={(event) => patch({ pricePerKg: event.target.value })}
                />
              )}
            </Field>
          </div>
        </section>
      </div>
    </Sheet>
  );
}
