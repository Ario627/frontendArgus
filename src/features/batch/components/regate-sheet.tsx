import { useEffect, useState } from "react";
import { isApiError } from "@/api/api-error";
import { useRegate } from "@/features/batch/hooks/use-regate";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ChipButton } from "@/shared/components/ui/chip";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { MOISTURE_LABELS, MOISTURE_PROXIES, type MoistureProxy } from "@/shared/constants/flow.constant";

export interface RegateSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly batchId: string;
  readonly currentMoistureProxy: MoistureProxy | null;
  readonly currentVisibleOil: boolean;
}

export function RegateSheet({
  open,
  onOpenChange,
  batchId,
  currentMoistureProxy,
  currentVisibleOil
}: RegateSheetProps) {
  const regate = useRegate();
  const showToast = useToastStore((state) => state.show);
  const [moisture, setMoisture] = useState<MoistureProxy | null>(currentMoistureProxy);
  const [visibleOil, setVisibleOil] = useState(currentVisibleOil);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMoisture(currentMoistureProxy);
    setVisibleOil(currentVisibleOil);
    setError(null);
  }, [open, currentMoistureProxy, currentVisibleOil]);

  const submit = () => {
    setError(null);
    regate.mutate(
      {
        batchId,
        patch: {
          ...(moisture === null ? {} : { moistureProxy: moisture }),
          visibleOil
        }
      },
      {
        onSuccess: () => {
          showToast({ message: "Gerbang dinilai ulang" });
          onOpenChange(false);
        },
        onError: (cause) => {
          setError(isApiError(cause) ? cause.message : "Tidak dapat menilai ulang saat ini.");
        }
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Nilai ulang gerbang"
      description="Simpan kondisi terbaru setelah perbaikan dilakukan."
      footer={
        <Button size="lg" fullWidth loading={regate.isPending} onClick={submit}>
          Nilai ulang sekarang
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div role="group" aria-label="Kadar air" className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">Kadar air</p>
          <p className="text-xs text-ink-lemah">Uji remas ulang sebelum memilih.</p>
          <div className="flex flex-wrap gap-2">
            {MOISTURE_PROXIES.map((proxy) => (
              <ChipButton
                key={proxy}
                selected={moisture === proxy}
                onClick={() => setMoisture(moisture === proxy ? null : proxy)}
              >
                {MOISTURE_LABELS[proxy]}
              </ChipButton>
            ))}
          </div>
        </div>
        <Checkbox
          label="Terlihat berminyak?"
          checked={visibleOil}
          onChange={(event) => setVisibleOil(event.target.checked)}
        />
        {error === null ? null : (
          <p role="alert" className="text-sm text-bata">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  );
}