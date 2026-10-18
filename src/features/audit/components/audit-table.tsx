import {
  describeAuditAction,
  describeAuditActor,
  describeAuditDetail,
  describeAuditOutcome
} from "@/features/audit/audit-format";
import { cn } from "@/shared/lib/cn";
import { formatDateTime } from "@/shared/lib/format";
import type { AuditLogDto } from "@/shared/types/audit.types";

export interface AuditTableProps {
  readonly logs: readonly AuditLogDto[];
  readonly className?: string;
}

export function AuditTable({ logs, className }: AuditTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Waktu</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Aktor</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Aksi</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Hasil</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Rincian</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const outcome = describeAuditOutcome(log);
            const detail = describeAuditDetail(log);
            return (
              <tr
                key={log.id}
                className="border-b border-garis align-top transition-colors duration-150 ease-out hover:bg-ink/5"
              >
                <td className="px-2 py-2 font-mono text-2xs tabular-nums whitespace-nowrap text-ink-lemah">
                  {formatDateTime(log.ts)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="text-xs text-ink">{describeAuditActor(log)}</span>
                </td>
                <td className="px-2 py-2">
                  <span className="text-xs text-ink">{describeAuditAction(log.aksi)}</span>
                  <span className="mt-0.5 block font-mono text-2xs text-ink-lemah">{log.aksi}</span>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {outcome === null ? (
                    <span className="text-xs text-ink-lemah">—</span>
                  ) : (
                    <span
                      className={cn(
                        "text-xs",
                        outcome.startsWith("berhasil") ? "text-daun" : outcome === "gagal" ? "text-bata" : "text-ink-lemah"
                      )}
                    >
                      {outcome}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2">
                  {detail === null ? (
                    <span className="text-xs text-ink-lemah">—</span>
                  ) : (
                    <span className="font-mono text-2xs text-ink-lemah">{detail}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
