import { Chip } from "@/shared/components/ui/chip";
import { DEVICE_TYPE_LABELS } from "@/shared/constants/device.constant";
import { cn } from "@/shared/lib/cn";
import { formatMoment } from "@/shared/lib/format";
import type { DeviceDto } from "@/shared/types/device.types";

export interface DeviceTableProps {
  readonly devices: readonly DeviceDto[];
  readonly onOpen: (device: DeviceDto) => void;
}

const targetLabelOf = (device: DeviceDto): string => {
  if (device.fleetId !== null) return `armada ${device.fleetId.slice(0, 8)}`;
  if (device.sppgId !== null) return `sppg ${device.sppgId.slice(0, 8)}`;
  return "tanpa target";
};

export function DeviceTable({ devices, onOpen }: DeviceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-garis text-xs text-ink-lemah">
            <th scope="col" className="py-2 pr-3 font-medium">
              Perangkat
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Tipe
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Target
            </th>
            <th scope="col" className="hidden py-2 pr-3 font-medium sm:table-cell">
              Terakhir aktif
            </th>
            <th scope="col" className="py-2 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr
              key={device.id}
              onClick={() => onOpen(device)}
              className="cursor-pointer border-b border-garis transition-colors last:border-b-0 hover:bg-ink/5"
            >
              <td className="max-w-40 py-2.5 pr-3">
                <button
                  type="button"
                  onClick={() => onOpen(device)}
                  className="block max-w-full truncate font-mono text-sm text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-biru-tinta"
                >
                  {device.mqttUsername}
                </button>
                {device.firmware === null ? null : (
                  <span className="block truncate text-xs text-ink-lemah">{device.firmware}</span>
                )}
              </td>
              <td className="py-2.5 pr-3">
                <Chip>{DEVICE_TYPE_LABELS[device.tipe]}</Chip>
              </td>
              <td className="py-2.5 pr-3 font-mono text-xs text-ink-lemah">{targetLabelOf(device)}</td>
              <td className="hidden py-2.5 pr-3 text-xs text-ink-lemah sm:table-cell">
                {device.lastSeenAt === null ? "belum pernah" : formatMoment(device.lastSeenAt)}
              </td>
              <td className="py-2.5">
                <span
                  className={cn(
                    "font-mono text-xs",
                    device.aktif ? "text-daun" : "text-bata"
                  )}
                >
                  {device.aktif ? "aktif" : "dicabut"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
