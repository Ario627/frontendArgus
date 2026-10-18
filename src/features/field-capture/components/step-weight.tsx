import { useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { formatKgValue, parseKg } from "@/shared/lib/format";
import type { CaptureFormValues } from "@/features/field-capture/schemas/create-batch.schema";

export interface StepWeightProps {
  readonly form: UseFormReturn<CaptureFormValues>;
}

const QUICK_ADDS: readonly { readonly delta: number; readonly label: string }[] = Object.freeze([
  { delta: 0.5, label: "+0,5" },
  { delta: 1, label: "+1" },
  { delta: 5, label: "+5" }
]);

export function StepWeight({ form }: StepWeightProps) {
  const weightText = useWatch({ control: form.control, name: "weightText" }) ?? "";
  const error = form.formState.errors.weightText?.message;

  const addDelta = (delta: number) => {
    const current = parseKg(weightText) ?? 0;
    const next = Math.round((current + delta) * 100) / 100;
    form.setValue("weightText", formatKgValue(next, "manual"), { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Berat" hint="Bila ragu, timbang ulang." required error={error}>
        {(control) => (
          <Input
            id={control.id}
            aria-describedby={control.describedBy}
            invalid={control.invalid}
            required={control.required}
            inputSize="field"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="next"
            suffix="kg"
            placeholder="Contoh: 12,4"
            className="h-16 font-mono text-field [font-variant-numeric:tabular-nums]"
            {...form.register("weightText")}
          />
        )}
      </Field>
      <div className="flex flex-wrap gap-2">
        {QUICK_ADDS.map((item) => (
          <Button
            key={item.label}
            variant="secondary"
            size="sm"
            className="font-mono pointer-coarse:h-11"
            onClick={() => addDelta(item.delta)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}