import { Chip } from "@/shared/components/ui/chip";
import { FACILITY_KIND_LABELS } from "@/shared/types/facility.types";
import { cn } from "@/shared/lib/cn";
import { formatKgValue } from "@/shared/lib/format";
import type { FacilityDto } from "@/shared/types/facility.types";

const LEVEL_ORDER: Readonly<Record<string, number>> = Object.freeze({
  T1: 1,
  T2: 2,
  T3: 3,
  T4: 4
});

export interface FacilityTableProps {
  readonly facilities: readonly FacilityDto[];
  readonly onOpen: (facility: FacilityDto) => void;
  readonly className?: string;
}

export function FacilityTable({ facilities, onOpen, className }: FacilityTableProps) {
  const sorted = [...facilities].sort((left, right) => {
    const levelDiff = (LEVEL_ORDER[left.tingkat] ?? 9) - (LEVEL_ORDER[right.tingkat] ?? 9);
    if (levelDiff !== 0) return levelDiff;
    return left.nama.localeCompare(right.nama, "id");
  });

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Nama</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Tingkat</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Jenis</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Kapasitas</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Jam operasi</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((facility) => (
            <tr
              key={facility.id}
              className="relative h-11 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
            >
              <td className="px-2">
                <button
                  type="button"
                  onClick={() => onOpen(facility)}
                  className="flex items-center gap-2 text-sm text-ink after:absolute after:inset-0 hover:underline"
                >
                  <span className="min-w-0 truncate">{facility.nama}</span>
                  {facility.mitra ? <Chip className="h-5 text-2xs">mitra</Chip> : null}
                </button>
              </td>
              <td className="px-2">
                <Chip className="h-6">{facility.tingkat}</Chip>
              </td>
              <td className="px-2 text-xs text-ink-lemah">{FACILITY_KIND_LABELS[facility.jenis]}</td>
              <td className="px-2 text-right font-mono text-xs tabular-nums text-ink-lemah">
                {facility.kapasitasKgHari === null ? "—" : formatKgValue(facility.kapasitasKgHari)}
              </td>
              <td className="px-2 font-mono text-xs text-ink-lemah">
                {facility.jamOperasi ?? "—"}
              </td>
              <td className="px-2 text-xs">
                {facility.aktif ? (
                  <span className="text-daun">Aktif</span>
                ) : (
                  <span className="text-ink-lemah">Nonaktif</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
