import { isApiError } from "@/api/api-error";
import { buildProfileRuleLines } from "@/features/facilities/facility-rules";
import {
  useFacilityProfile,
  useProfileVersions
} from "@/features/facilities/hooks/use-facility-profile";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { Sheet } from "@/shared/components/ui/sheet";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { FACILITY_KIND_LABELS } from "@/shared/types/facility.types";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatNumber, formatKgValue } from "@/shared/lib/format";
import type { FacilityDto } from "@/shared/types/facility.types";

interface InfoRowProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-garis py-2 last:border-b-0">
      <dt className="shrink-0 text-sm text-ink-lemah">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

export interface FacilityDetailSheetProps {
  readonly facility: FacilityDto | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly showVersions: boolean;
}

export function FacilityDetailSheet({
  facility,
  onOpenChange,
  showVersions
}: FacilityDetailSheetProps) {
  const profile = useFacilityProfile(facility?.id ?? null);
  const versions = useProfileVersions(facility !== null && showVersions ? facility.id : null);

  if (facility === null) return null;

  const apiError = isApiError(profile.error) ? profile.error : null;
  const profileMissing =
    apiError !== null && (apiError.status === 404 || apiError.code === "PROFILE_NOT_FOUND");
  const rules = profile.data?.rules ?? null;
  const ruleLines = rules === null ? [] : buildProfileRuleLines(rules);
  const versionRows = versions.data?.items ?? [];

  return (
    <Sheet
      open
      onOpenChange={onOpenChange}
      title={facility.nama}
      description={`${facility.tingkat} · ${FACILITY_KIND_LABELS[facility.jenis]}${
        facility.aktif ? "" : " · nonaktif"
      }`}
    >
      <div className="flex flex-col gap-5">
        <dl className="flex flex-col">
          <InfoRow label="Kapasitas">
            {facility.kapasitasKgHari === null ? "Belum diisi" : `${formatKgValue(facility.kapasitasKgHari)}/hari`}
          </InfoRow>
          <InfoRow label="Jam operasi">{facility.jamOperasi ?? "Belum diisi"}</InfoRow>
          <InfoRow label="Koordinat">
            <span className="font-mono text-xs tabular-nums">
              {formatNumber(facility.lat, 5)}, {formatNumber(facility.lng, 5)}
            </span>
          </InfoRow>
          <InfoRow label="Mitra">{facility.mitra ? "Ya" : "Tidak"}</InfoRow>
        </dl>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-ink">Profil penerimaan aktif</h2>

          {profile.isPending ? <SkeletonList rows={4} /> : null}

          {profileMissing ? (
            <p className="text-sm text-kunyit">
              Profil belum diisi. Gerbang memakai profil aman bawaan untuk fasilitas ini.
            </p>
          ) : null}

          {profile.isError && !profileMissing ? (
            <ErrorState
              description={apiError?.message ?? "Profil tidak dapat dimuat."}
              requestId={apiError?.requestId}
              onRetry={() => void profile.refetch()}
            />
          ) : null}

          {profile.data === undefined ? null : (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-2xs text-ink-lemah">
                versi {profile.data.version} · berlaku sejak {formatDateTime(profile.data.effectiveFrom)}
              </p>
              {ruleLines.length === 0 ? (
                <p className="text-sm text-ink-lemah">Profil tidak memuat aturan tambahan.</p>
              ) : (
                <dl className="flex flex-col">
                  {ruleLines.map((line) => (
                    <div
                      key={line.label}
                      className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5 last:border-b-0"
                    >
                      <dt className="text-xs text-ink-lemah">{line.label}</dt>
                      <dd className={cn("text-right text-xs text-ink")}>{line.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </section>

        {showVersions ? (
          <section className="flex flex-col gap-2 border-t border-garis pt-4">
            <h2 className="text-sm font-medium text-ink">Riwayat versi profil</h2>
            {versions.isPending ? <SkeletonList rows={3} /> : null}
            {versions.data !== undefined && versionRows.length === 0 ? (
              <p className="text-sm text-ink-lemah">Belum ada versi profil.</p>
            ) : null}
            {versionRows.length > 0 ? (
              <ul className="flex flex-col">
                {versionRows.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-baseline justify-between gap-4 border-b border-garis py-2 last:border-b-0"
                  >
                    <span className="font-mono text-xs text-ink">versi {entry.version}</span>
                    <span className="font-mono text-2xs text-ink-lemah">
                      {formatDateTime(entry.effectiveFrom)}
                      {entry.effectiveUntil === null
                        ? " · berjalan"
                        : ` → ${formatDateTime(entry.effectiveUntil)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>
    </Sheet>
  );
}
