import { type UseFormRegister, type FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/ui/button";
import { recoveryAssignSchema, type RecoveryAssignFormValues } from "../schemas/recovery-assign.schema";

interface RecoveryAssignFormProps {
  brokenFleetId: string;
  candidateFleets: readonly { id: string; label: string }[];
  pendingStops: readonly { id: string; label: string }[];
  onSubmit: (values: RecoveryAssignFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface CheckboxFieldProps {
  name: keyof Pick<RecoveryAssignFormValues, "receivingFleetIds" | "redistributedStopIds">;
  label: string;
  options: readonly { id: string; label: string }[];
  register: UseFormRegister<RecoveryAssignFormValues>;
  errors: FieldErrors<RecoveryAssignFormValues>;
}


function CheckboxGroup({
  name,
  label,
  options,
  register,
  errors,
}: CheckboxFieldProps) {
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
        {options.length === 0 ? (
          <p className="text-xs text-muted-foreground">Tidak ada pilihan tersedia</p>
        ) : (
          options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <input
                type="checkbox"
                value={opt.id}
                {...register(name)}
                className="h-4 w-4 rounded border-border"
              />
              {opt.label}
            </label>
          ))
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
  onSubmit,
  onCancel,
  isSubmitting,
}: RecoveryAssignFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryAssignFormValues>({
    resolver: zodResolver(recoveryAssignSchema),
    defaultValues: {
      brokenFleetId,
      receivingFleetIds: [],
      redistributedStopIds: [],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("brokenFleetId")} />

      <CheckboxGroup
        name="receivingFleetIds"
        label="Truk Penerima"
        options={candidateFleets}
        register={register}
        errors={errors}
      />

      <CheckboxGroup
        name="redistributedStopIds"
        label="Stop untuk Didistribusi Ulang"
        options={pendingStops}
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
          Assign Recovery
        </Button>
      </div>
    </form>
  );
}