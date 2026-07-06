import { useForm, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode } from "react";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../lib/cn";
import {
  createDestinationSchema,
  type CreateDestinationFormValues,
} from "../schemas/create-destination.schema";
import {
  updateDestinationSchema,
  type UpdateDestinationFormValues,
} from "../schemas/update-destination.schema";
import type { Destination } from "../../../shared/types/destination.types";
import type { DestinationType } from "../../../shared/types/common.types";

type FormMode = "create" | "edit";
type FormValues = CreateDestinationFormValues & Partial<UpdateDestinationFormValues>;

interface DestinationFormProps {
  mode: FormMode;
  defaultValues?: Partial<FormValues>;
  destination?: Destination;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DESTINATION_TYPE_OPTIONS: readonly { value: DestinationType; label: string }[] = [
  { value: "TPA", label: "TPA — Tempat Pemrosesan Akhir" },
  { value: "RDF", label: "RDF — Refuse Derived Fuel" },
  { value: "TPS_3R", label: "TPS 3R — Tempat Pengolahan Sampah 3R" },
] as const;

interface FieldProps {
  name: keyof FormValues;
  label: string;
  type?: "text" | "number";
  placeholder?: string;
  optional?: boolean;
  helperText?: ReactNode;
}

function FormField({
  name,
  label,
  type = "text",
  placeholder,
  optional,
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
        htmlFor={`dest-${name}`}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {optional && (
          <span className="ml-1 text-xs text-muted-foreground">(opsional)</span>
        )}
      </label>
      <input
        id={`dest-${name}`}
        type={type}
        placeholder={placeholder}
        step={type === "number" ? "any" : undefined}
        {...register(name)}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
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

export function DestinationForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: DestinationFormProps) {
  const schema = mode === "create" ? createDestinationSchema : updateDestinationSchema;

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
        name="name"
        label="Nama Destinasi"
        placeholder="Contoh: TPA Bantargebang"
        register={register}
        errors={errors}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="dest-type"
          className="text-sm font-medium text-foreground"
        >
          Tipe Destinasi
        </label>
        <select
          id="dest-type"
          {...register("type")}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            errors.type && "border-destructive",
          )}
        >
          {DESTINATION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.type?.message && (
          <p className="text-xs text-destructive">
            {errors.type.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          name="latitude"
          label="Latitude"
          type="number"
          placeholder="-6.2"
          helperText="Rentang: -90 hingga 90"
          register={register}
          errors={errors}
        />
        <FormField
          name="longitude"
          label="Longitude"
          type="number"
          placeholder="106.8"
          helperText="Rentang: -180 hingga 180"
          register={register}
          errors={errors}
        />
      </div>

      <FormField
        name="capacityKg"
        label="Kapasitas (kg)"
        type="number"
        placeholder="0"
        register={register}
        errors={errors}
      />

      <FormField
        name="priority"
        label="Prioritas"
        type="number"
        placeholder="1-5"
        optional
        helperText="Skala 1 (tertinggi) hingga 5 (terendah)"
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
          {isEditMode ? "Simpan Perubahan" : "Tambah Destinasi"}
        </Button>
      </div>
    </form>
  );
}