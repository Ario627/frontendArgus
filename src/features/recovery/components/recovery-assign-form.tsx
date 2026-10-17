import { useEffect } from "react";
import { type UseFormRegister, type FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/ui/button";
import { recoveryAssignSchema, type RecoveryAssignFormValues } from "../schemas/recovery-assign.schema";

interface RecoveryAssignFormProps {
  brokenFleetId: string;
  candidateFleets: readonly { id: string; label: string }[];
  pendingStops: readonly { id: string; label: string }[];
  autoValues?: RecoveryAssignFormValues | null;
  onSubmit: (values: RecoveryAssignFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isAutoMode?: boolean;
}

interface CheckboxFieldProps {
  name: keyof Pick<RecoveryAssignFormValues, "receivingFleetIds" | "redistributedStopIds">;
  label: string;
  options: readonly { id: string; label: string }[];
  autoIds: readonly string[];
  isAuto: boolean;
  register: UseFormRegister<RecoveryAssignFormValues>;
  errors: FieldErrors<RecoveryAssignFormValues>;
}

function CheckboxGroup({
  name,
  label,
  options,
  autoIds,
  isAuto,
  register,
  errors,
}: CheckboxFieldProps) {
  const { onChange: rhfOnChange, ...rhfProps } = register(name);
  const error = errors[name]?.message as string | undefined;
  const autoSet = new Set(autoIds);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="max-h-48 space-y-2 overflow-y-auto border border-border p-3">
        {options.length === 0 ? (
          <p className="text-xs text-muted-foreground">Tidak ada pilihan tersedia</p>
        ) : (
          options.map((opt) => {
            const isAutoSelected = autoSet.has(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  value={opt.id}
                  onChange={rhfOnChange}
                  {...rhfProps}
                  className="h-4 w-4 rounded border-border"
                />
                {opt.label}
                {isAuto && isAutoSelected && (
                  <span className="text-[10px] text-brand font-medium ml-1">(auto)</span>
                )}
              </label>
            );
          })
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function RecoveryAssignForm({
  brokenFleetId,
  candidateFleets,
  pendingStops,
  autoValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isAutoMode,
}: RecoveryAssignFormProps) {
  const defaultValues: RecoveryAssignFormValues = autoValues ?? {
    brokenFleetId,
    receivingFleetIds: [],
    redistributedStopIds: [],
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecoveryAssignFormValues>({
    resolver: zodResolver(recoveryAssignSchema),
    defaultValues,
  });

  useEffect(() => {
    if (autoValues) {
      reset(autoValues);
    }
  }, [autoValues, reset]);

  const submitLabel = isAutoMode ? "Konfirmasi & Override" : "Assign Recovery";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("brokenFleetId")} />

      <CheckboxGroup
        name="receivingFleetIds"
        label="Truk Penerima"
        options={candidateFleets}
        autoIds={autoValues?.receivingFleetIds ?? []}
        isAuto={isAutoMode ?? false}
        register={register}
        errors={errors}
      />

      <CheckboxGroup
        name="redistributedStopIds"
        label="Stop untuk Didistribusi Ulang"
        options={pendingStops}
        autoIds={autoValues?.redistributedStopIds ?? []}
        isAuto={isAutoMode ?? false}
        register={register}
        errors={errors}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
