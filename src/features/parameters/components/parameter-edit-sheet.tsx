import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useUpdateParameter } from "@/features/parameters/hooks/use-update-parameter";
import {
  PARAMETER_DESCRIPTIONS,
  PARAMETER_LABELS,
  PARAMETER_SOURCE_LABELS,
  formatParameterValue,
  parseParameterValue
} from "@/features/parameters/parameter-format";
import { Button } from "@/shared/components/ui/button";
import { ChipButton } from "@/shared/components/ui/chip";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Sheet } from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { formatMoment } from "@/shared/lib/format";
import {
  PARAMETER_SOURCES,
  type ParameterDto,
  type ParameterSource
} from "@/shared/types/parameter.types";

const NOTE_MIN = 10;
const NOTE_MAX = 400;

export interface ParameterEditSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly parameter: ParameterDto | null;
  readonly canEdit: boolean;
}

function InfoRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5 last:border-b-0">
      <dt className="text-xs text-ink-lemah">{label}</dt>
      <dd className="text-right font-mono text-xs text-ink">{value}</dd>
    </div>
  );
}

export function ParameterEditSheet({
  open,
  onOpenChange,
  parameter,
  canEdit
}: ParameterEditSheetProps) {
  const update = useUpdateParameter();
  const showToast = useToastStore((state) => state.show);

  const [sumber, setSumber] = useState<ParameterSource>("belum_ada");
  const [nilaiText, setNilaiText] = useState("");
  const [satuanText, setSatuanText] = useState("");
  const [catatanText, setCatatanText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && parameter !== null) {
      setSumber(parameter.sumber);
      setNilaiText(parameter.nilai === null ? "" : formatParameterValue(parameter.nilai));
      setSatuanText(parameter.satuan ?? "");
      setCatatanText(parameter.catatan ?? "");
      setError(null);
    }
  }

  if (parameter === null) return null;

  const title = PARAMETER_LABELS[parameter.kunci];
  const description = PARAMETER_DESCRIPTIONS[parameter.kunci];

  const submit = () => {
    setError(null);
    const nilai = sumber === "belum_ada" ? null : parseParameterValue(nilaiText);
    if (sumber !== "belum_ada" && nilai === null) {
      setError("Isi nilai numerik (contoh: 0,25 atau 1500).");
      return;
    }
    const catatan = catatanText.trim();
    if (sumber === "manual_admin" && catatan.length < NOTE_MIN) {
      setError(`Catatan wajib minimal ${NOTE_MIN} karakter untuk sumber manual admin.`);
      return;
    }
    if (catatan.length > NOTE_MAX) {
      setError(`Catatan maksimal ${NOTE_MAX} karakter.`);
      return;
    }
    update.mutate(
      {
        kunci: parameter.kunci,
        input: {
          nilai,
          sumber,
          satuan: satuanText.trim() === "" ? null : satuanText.trim(),
          catatan: catatan === "" ? null : catatan
        }
      },
      {
        onSuccess: () => {
          showToast({ message: `${title} tersimpan` });
          onOpenChange(false);
        },
        onError: (cause) => {
          setError(isApiError(cause) ? cause.message : "Tidak dapat menyimpan parameter.");
        }
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        canEdit ? (
          <Button size="lg" fullWidth loading={update.isPending} onClick={submit}>
            Simpan parameter
          </Button>
        ) : undefined
      }
    >
      {canEdit ? (
        <div className="flex flex-col gap-5">
          <div role="group" aria-label="Sumber nilai" className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink">Sumber</p>
            <div className="flex flex-wrap gap-2">
              {PARAMETER_SOURCES.map((source) => (
                <ChipButton
                  key={source}
                  selected={sumber === source}
                  onClick={() => setSumber(source)}
                >
                  {PARAMETER_SOURCE_LABELS[source]}
                </ChipButton>
              ))}
            </div>
            <p className="text-xs text-ink-lemah">
              {sumber === "belum_ada"
                ? "Tanpa nilai — sistem memakai jalur aman T4 untuk parameter ini."
                : sumber === "manual_admin"
                  ? "Nilai ditetapkan manual; catatan wajib menjelaskan dasar angkanya."
                  : "Nilai tersimpan apa adanya dari sumber yang dipilih."}
            </p>
          </div>

          <Field
            label="Nilai"
            required={sumber !== "belum_ada"}
            hint={sumber === "belum_ada" ? "Kosongkan untuk menandai belum ada." : undefined}
          >
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                inputMode="decimal"
                autoComplete="off"
                disabled={sumber === "belum_ada"}
                placeholder="Contoh: 0,25"
                suffix={parameter.satuan ?? undefined}
                className="font-mono"
                value={sumber === "belum_ada" ? "" : nilaiText}
                onChange={(event) => setNilaiText(event.target.value)}
              />
            )}
          </Field>

          <Field label="Satuan" hint="Opsional — tampil di samping nilai (contoh: Rp/km).">
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                autoComplete="off"
                maxLength={24}
                value={satuanText}
                onChange={(event) => setSatuanText(event.target.value)}
              />
            )}
          </Field>

          <Field
            label="Catatan"
            required={sumber === "manual_admin"}
            hint={
              sumber === "manual_admin"
                ? `Wajib, minimal ${NOTE_MIN} karakter — tersimpan untuk audit.`
                : "Opsional."
            }
          >
            {(control) => (
              <Textarea
                id={control.id}
                aria-describedby={control.describedBy}
                rows={3}
                maxLength={NOTE_MAX}
                value={catatanText}
                onChange={(event) => setCatatanText(event.target.value)}
              />
            )}
          </Field>

          {error === null ? null : (
            <p role="alert" className="text-sm text-bata">
              {error}
            </p>
          )}
        </div>
      ) : (
        <dl className="flex flex-col">
          <InfoRow label="Nilai" value={formatParameterValue(parameter.nilai)} />
          <InfoRow label="Satuan" value={parameter.satuan ?? "—"} />
          <InfoRow label="Sumber" value={PARAMETER_SOURCE_LABELS[parameter.sumber]} />
          <InfoRow label="Status" value={parameter.terkalibrasi ? "Terkalibrasi" : "Belum terkalibrasi"} />
          <InfoRow
            label="Diperbarui"
            value={parameter.updatedAt === null ? "Belum pernah" : formatMoment(parameter.updatedAt)}
          />
          {parameter.catatan === null ? null : (
            <div className="flex flex-col gap-1 pt-3">
              <p className="text-xs text-ink-lemah">Catatan</p>
              <p className="text-sm text-ink">{parameter.catatan}</p>
            </div>
          )}
        </dl>
      )}
    </Sheet>
  );
}