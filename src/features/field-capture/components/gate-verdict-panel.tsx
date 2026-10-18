import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { ChipButton } from "@/shared/components/ui/chip";
import { Stamp } from "@/shared/components/ui/stamp";
import { BATCH_STATUS_LABELS } from "@/shared/constants/batch.constant";
import { MOISTURE_LABELS, MOISTURE_PROXIES, type MoistureProxy } from "@/shared/constants/flow.constant";
import { formatKg } from "@/shared/lib/format";
import { readGateDetail } from "@/shared/lib/gate-detail";
import type { BatchDetailDto, ReGateInput } from "@/shared/types/batch.types";

export interface GateVerdictPanelProps {
  readonly batch: BatchDetailDto;
  readonly duplicate: boolean;
  readonly regatePending: boolean;
  readonly onRegate: (patch: ReGateInput) => void;
  readonly onNew: () => void;
}

function FindingList({ title, items }: { readonly title: string; readonly items: readonly { rule: string; detail: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-ink">{title}</p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={`${item.rule}-${item.detail}`} className="text-sm text-ink-lemah">
            {item.detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GateVerdictPanel({
  batch,
  duplicate,
  regatePending,
  onRegate,
  onNew
}: GateVerdictPanelProps) {
  const detail = readGateDetail(batch.gateDetail);
  const [moisture, setMoisture] = useState<string>(batch.moistureProxy ?? "");

  useEffect(() => {
    setMoisture(batch.moistureProxy ?? "");
  }, [batch.moistureProxy]);

  const canRegate = batch.status === "GAGAL_GATE";

  const submitRegate = () => {
    const patch: ReGateInput = moisture === "" ? {} : { moistureProxy: moisture as MoistureProxy };
    onRegate(patch);
  };

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        {batch.gateStatus === null ? null : <Stamp verdict={batch.gateStatus} />}
        <span className="text-sm text-ink-lemah">
          {BATCH_STATUS_LABELS[batch.status]} · {formatKg(batch.weightKg, "manual")}
        </span>
      </div>

      {duplicate ? (
        <p className="text-sm text-ink-lemah">Catatan ini sudah tersimpan sebelumnya.</p>
      ) : null}

      {detail !== null && detail.fixes.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-ink">Yang perlu dilakukan</p>
          <ol className="flex list-decimal flex-col gap-1 pl-5">
            {detail.fixes.map((fix) => (
              <li key={fix} className="text-sm text-ink">
                {fix}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {detail === null ? null : (
        <>
          <FindingList title="Alasan" items={detail.violations} />
          <FindingList title="Catatan" items={detail.notes} />
          {detail.usedDefaultProfile ? (
            <p className="text-sm text-ink-lemah">
              Profil fasilitas belum diisi — gerbang memakai profil aman bawaan.
            </p>
          ) : null}
        </>
      )}

      {batch.status === "TERSANGKUT" ? (
        <p className="text-sm text-ink-lemah">
          Batch tercatat sebagai tersangkut. Koordinasikan penanganan manual dengan admin.
        </p>
      ) : null}

      {canRegate ? (
        <div className="flex flex-col gap-2 rounded-kontainer border border-garis p-3">
          <p className="text-sm text-ink">Sudah diperbaiki? Nilai ulang kadar air lalu periksa kembali.</p>
          <div className="flex flex-wrap gap-2">
            {MOISTURE_PROXIES.map((proxy) => (
              <ChipButton
                key={proxy}
                selected={moisture === proxy}
                onClick={() => setMoisture(moisture === proxy ? "" : proxy)}
              >
                {MOISTURE_LABELS[proxy]}
              </ChipButton>
            ))}
          </div>
          <div>
            <Button variant="secondary" loading={regatePending} onClick={submitRegate}>
              Catat perbaikan selesai
            </Button>
          </div>
        </div>
      ) : null}

      <div>
        <Button variant="ghost" onClick={onNew}>
          Catat batch lagi
        </Button>
      </div>
    </div>
  );
}