import { useForm, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode } from "react";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../lib/cn";
import {
  createFleetSchema,
  type CreateFleetFormValues,
} from "../schemas/create-fleet.schema";
import {
  updateFleetSchema,
  type UpdateFleetFormValues,
} from "../schemas/update-fleet.schema";
import type { Fleet } from "../../../shared/types/fleet.types";

type FormMode = "create" | "edit";
type FormValues = CreateFleetFormValues & Partial<UpdateFleetFormValues>;

interface FleetFormProps {
  mode: FormMode;
  defaultValues?: Partial<FormValues>;
  fleet?: Fleet;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface FieldProps {
  name: keyof FormValues;
  label: string;
  type?: "text" | "number";
  placeholder?: string;
  optional?: boolean;
  readOnly?: boolean;
  helperText?: ReactNode;
}

function FormField({
  name,
  label,
  type = "text",
  placeholder,
  optional,
  readOnly,
  helperText,
  register,
  errors,
}: FieldProps & {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}) {
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={`fleet-${name}`}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {optional && (
          <span className="ml-1 text-xs text-muted-foreground">(opsional)</span>
        )}
      </label>
      <input
        id={`fleet-${name}`}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={readOnly}
        step={type === "number" ? "1" : undefined}
        {...register(name)}
        className={cn(
          "flex h-10 w-full border border-border bg-transparent px-3 py-2 text-sm",
          "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          error && "border-destructive",
        )}
      />
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FleetForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: FleetFormProps) {
  const schema = mode === "create" ? createFleetSchema : updateFleetSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: defaultValues ?? {},
  });

  const isEditMode = mode === "edit";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <FormField
        name="plateNumber"
        label="Nomor Polisi"
        placeholder="Contoh: B1234-CD"
        readOnly={isEditMode}
        helperText={
          isEditMode
            ? "Nomor polisi tidak dapat diubah setelah pendaftaran"
            : "Format: huruf besar, angka, atau strip (3-12 karakter)"
        }
        register={register}
        errors={errors}
      />

      <FormField
        name="driverName"
        label="Nama Sopir"
        placeholder="Masukkan nama sopir"
        register={register}
        errors={errors}
      />

      <FormField
        name="driverContact"
        label="Kontak Sopir"
        placeholder="Contoh: 081234567890"
        optional
        register={register}
        errors={errors}
      />

      <FormField
        name="capacityKg"
        label="Kapasitas (kg)"
        type="number"
        placeholder="0"
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
          {isEditMode ? "Simpan Perubahan" : "Tambah Armada"}
        </Button>
      </div>
    </form>
  );
}