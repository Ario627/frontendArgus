import { Link } from "react-router";
import { RouteStatusChip } from "@/features/routes/components/route-status-chip";
import { ROUTE_SOURCE_LABELS } from "@/features/routes/route-labels";
import { cn } from "@/shared/lib/cn";
import { formatDateOnly, formatInt, formatKgValue, formatNumber } from "@/shared/lib/format";
import type { RoutePlanDto } from "@/shared/types/route.types";

export interface RouteTableProps {
  readonly plans: readonly RoutePlanDto[];
  readonly className?: string;
}

export function RouteTable({ plans, className }: RouteTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Tanggal</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Status</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Sumber</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Muatan</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Jarak</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Stop</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr
              key={plan.id}
              className="relative h-11 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
            >
              <td className="px-2">
                <Link
                  to={`/routes/${plan.id}`}
                  className="font-mono text-xs text-ink after:absolute after:inset-0 hover:underline"
                >
                  {formatDateOnly(plan.tanggal)}
                </Link>
              </td>
              <td className="px-2">
                <RouteStatusChip status={plan.status} />
              </td>
              <td className="px-2 text-xs text-ink-lemah">
                {ROUTE_SOURCE_LABELS[plan.source]}
                {plan.lowConfidence ? (
                  <span className="ml-1.5 text-kunyit">· jarak perkiraan</span>
                ) : null}
              </td>
              <td className="px-2 text-right font-mono text-xs tabular-nums">
                {formatKgValue(plan.totalKg)}
              </td>
              <td className="px-2 text-right font-mono text-xs tabular-nums text-ink-lemah">
                {plan.totalKm === null ? "—" : `${formatNumber(plan.totalKm, 1)} km`}
              </td>
              <td className="px-2 text-right font-mono text-xs tabular-nums text-ink-lemah">
                {plan.ringkasan === null ? "—" : formatInt(plan.ringkasan.vehicles.length)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}