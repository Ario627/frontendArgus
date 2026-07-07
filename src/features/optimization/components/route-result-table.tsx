import {memo, useMemo} from "react";
import { DataTable, type Column } from "../../../shared/components/ui/data-table";
import type { RouteResult } from "../../../shared/types/optimization.types";

interface RouteResultTableProps {
  routes: readonly RouteResult[] | undefined;
}

function formatKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

function RouteResultTableInner({ routes }: RouteResultTableProps) {
  const columns = useMemo<Column<RouteResult>[]>(
    () => [
      {
        key: "vehicleId",
        header: "Kendaraan",
        accessor: (row) => (
          <span className="font-medium">{row.vehicleId}</span>
        ),
        width: "140px",
      },
      {
        key: "stops",
        header: "Jumlah Stop",
        accessor: (row) => `${row.stops.length} titik`,
        width: "120px",
      },
      {
        key: "totalKm",
        header: "Total Jarak",
        accessor: (row) => formatKm(row.totalKm),
        width: "120px",
      },
      {
        key: "totalMinutes",
        header: "Total Durasi",
        accessor: (row) => formatMinutes(row.totalMinutes),
        width: "120px",
      },
      {
        key: "firstStop",
        header: "Stop Pertama",
        accessor: (row) => row.stops[0]?.destId ?? "—",
        width: "140px",
      },
      {
        key: "lastStop",
        header: "Stop Terakhir",
        accessor: (row) => row.stops[row.stops.length - 1]?.destId ?? "—",
        width: "140px",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={routes}
      emptyMessage="Belum ada rute hasil optimasi"
      getRowKey={(row) => row.vehicleId}
    />
  );
}

export const RouteResultTable = memo(RouteResultTableInner);