import { FleetStatusChip } from "@/features/fleet/components/fleet-status-chip";
import { formatStaleness } from "@/features/fleet/liveness";
import { cn } from "@/shared/lib/cn";
import { formatKgValue } from "@/shared/lib/format";
import type { FleetDto } from "@/shared/types/fleet.types";

export interface FleetTableProps {
  readonly fleets: readonly FleetDto[];
  readonly onOpen: (fleet: FleetDto) => void;
  readonly className?: string;
}

export function FleetTable({ fleets, onOpen, className }: FleetTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Kode</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Plat</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Pengemudi</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Kapasitas</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Status</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Terakhir lapor</th>
          </tr>
        </thead>
        <tbody>
          {fleets.map((fleet) => (
            <tr
              key={fleet.id}
              className="relative h-11 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
            >
              <td className="px-2">
                <button
                  type="button"
                  onClick={() => onOpen(fleet)}
                  className="font-mono text-xs text-ink after:absolute after:inset-0 hover:underline"
                >
                  {fleet.kode}
                </button>
              </td>
              <td className="px-2 font-mono text-xs text-ink-lemah">{fleet.plat ?? "—"}</td>
              <td className="px-2 text-xs text-ink-lemah">{fleet.driverNama ?? "—"}</td>
              <td className="px-2 text-right font-mono text-xs tabular-nums text-ink-lemah">
                {fleet.kapasitasKg === null ? "—" : formatKgValue(fleet.kapasitasKg)}
              </td>
              <td className="px-2">
                <FleetStatusChip status={fleet.statusOperasional} />
              </td>
              <td className="px-2 text-right font-mono text-xs tabular-nums text-ink-lemah">
                {formatStaleness(fleet.stalenessSeconds)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}