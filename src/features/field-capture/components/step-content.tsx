import { useWatch, type UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ChipButton } from "@/shared/components/ui/chip";
import { FractionPicker } from "@/features/field-capture/components/fraction-picker";
import { FLOW_LABELS, MOISTURE_LABELS, MOISTURE_PROXIES, WASTE_FLOWS, type WasteFlow } from "@/shared/constants/flow.constant";
import type { CaptureFormValues } from "@/features/field-capture/schemas/create-batch.schema";

export interface StepContentProps {
  readonly form: UseFormReturn<CaptureFormValues>;
}

export function StepContent({ form }: StepContentProps) {
  const aliran = useWatch({ control: form.control, name: "aliran" }) ?? "organik";
  const moistureProxy = useWatch({ control: form.control, name: "moistureProxy" }) ?? "";
  const visibleOil = useWatch({ control: form.control, name: "visibleOil" }) ?? false;

  const setAliran = (next: WasteFlow) => {
    form.setValue("aliran", next, { shouldDirty: true });
    if (next === "minyak") {
      form.setValue("dominant", "");
      form.setValue("extras", []);
      form.setValue("rinciEnabled", false);
      form.setValue("rinci", {});
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Jenis limbah" className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">Jenis limbah</p>
        <div className="flex gap-2">
          {WASTE_FLOWS.map((flow) => (
            <ChipButton key={flow} selected={aliran === flow} onClick={() => setAliran(flow)} className="pointer-coarse:h-11 pointer-coarse:px-4">
              {FLOW_LABELS[flow]}
            </ChipButton>
          ))}
        </div>
      </div>

      {aliran === "organik" ? <FractionPicker form={form} /> : null}

      <div role="group" aria-label="Kadar air" className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">Kadar air (opsional)</p>
        <p className="text-xs text-ink-lemah">Uji remas: kepal segenggam, lalu lihat tetesan.</p>
        <div className="flex flex-wrap gap-2">
          {MOISTURE_PROXIES.map((proxy) => (
            <ChipButton
              key={proxy}
              selected={moistureProxy === proxy}
              onClick={() => form.setValue("moistureProxy", moistureProxy === proxy ? "" : proxy, { shouldDirty: true })}
            >
              {MOISTURE_LABELS[proxy]}
            </ChipButton>
          ))}
        </div>
      </div>

      <Checkbox
        label="Terlihat berminyak?"
        checked={visibleOil}
        onChange={(event) => form.setValue("visibleOil", event.target.checked, { shouldDirty: true })}
      />
    </div>
  );
}