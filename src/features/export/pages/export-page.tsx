import { useMemo, useState } from "react";
import { ExportPanel, type SppgOption } from "@/features/export/components/export-panel";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { PageHeader } from "@/shared/components/layout/page-header";

export function ExportPage() {
  const sppgQuery = useSppgList(true);
  const [sppgId, setSppgId] = useState<string | null>(null);

  const sppgOptions = useMemo<SppgOption[]>(
    () => (sppgQuery.data?.items ?? []).map((sppg) => ({ id: sppg.id, nama: sppg.nama })),
    [sppgQuery.data]
  );

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader
        title="Ekspor audit"
        description="Unduh data batch untuk pemeriksaan DLH. Periode default 30 hari terakhir."
      />
      <ExportPanel sppgId={sppgId} sppgOptions={sppgOptions} onSppgChange={setSppgId} />
    </div>
  );
}