import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { isApiError } from "@/api/api-error";
import { useCreateSppg, useUpdateSppg } from "@/features/sppg/hooks/use-sppg-mutations";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import type { SppgDto } from "@/shared/types/sppg.types";

const optionalPositive = z
  .string()
  .trim()
  .refine((value) => value === "" || (/^\d+(\.\d+)?$/.test(value) && Number(value) > 0), {
    message: "Isi angka positif atau kosongkan."
  });

const sppgSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120, "Maksimal 120 karakter."),
  alamat: z.string().trim().max(300, "Maksimal 300 karakter."),
  lat: z
    .string()
    .trim()
    .refine((value) => value !== "" && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= 90, {
      message: "Latitude harus angka -90 sampai 90."
    }),
  lng: z
    .string()
    .trim()
    .refine(
      (value) => value !== "" && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= 180,
      { message: "Longitude harus angka -180 sampai 180." }
    ),
  porsiPerHari: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
      message: "Porsi per hari minimal 1."
    }),
  mitra: z.string().trim().max(120, "Maksimal 120 karakter."),
  kapasitasOlahKg: optionalPositive,
  aktif: z.boolean()
});

type SppgFormValues = z.infer<typeof sppgSchema>;

const toValues = (sppg: SppgDto | null): SppgFormValues => ({
  nama: sppg?.nama ?? "",
  alamat: sppg?.alamat ?? "",
  lat: sppg === null ? "" : String(sppg.lat),
  lng: sppg === null ? "" : String(sppg.lng),
  porsiPerHari: sppg === null ? "" : String(sppg.porsiPerHari),
  mitra: sppg?.mitra ?? "",
  kapasitasOlahKg: sppg?.kapasitasOlahKg === null || sppg === null ? "" : String(sppg.kapasitasOlahKg),
  aktif: sppg?.aktif ?? true
});

export interface SppgFormSheetProps {
  readonly sppg: SppgDto | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SppgFormSheet({ sppg, open, onOpenChange }: SppgFormSheetProps) {
  const create = useCreateSppg();
  const update = useUpdateSppg();
  const showToast = useToastStore((state) => state.show);
  const isEdit = sppg !== null;

  const form = useForm<SppgFormValues>({
    resolver: zodResolver(sppgSchema),
    mode: "onTouched",
    defaultValues: toValues(sppg)
  });

  const aktif = useWatch({ control: form.control, name: "aktif" });

  useEffect(() => {
    if (open) form.reset(toValues(sppg));
  }, [open, sppg, form]);

  const submit = form.handleSubmit((values) => {
    const payload = {
      nama: values.nama,
      alamat: values.alamat === "" ? null : values.alamat,
      lat: Number(values.lat),
      lng: Number(values.lng),
      porsiPerHari: Number(values.porsiPerHari),
      mitra: values.mitra === "" ? null : values.mitra,
      kapasitasOlahKg: values.kapasitasOlahKg === "" ? null : Number(values.kapasitasOlahKg)
    };

    const onError = (cause: unknown) => {
      showToast({
        message: isApiError(cause) ? cause.message : "SPPG tidak dapat disimpan.",
        tone: "bata"
      });
    };

    if (isEdit) {
      update.mutate(
        { sppgId: sppg.id, input: { ...payload, aktif: values.aktif } },
        {
          onSuccess: () => {
            showToast({ message: "Perubahan SPPG tersimpan." });
            onOpenChange(false);
          },
          onError
        }
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        showToast({ message: "SPPG terdaftar." });
        onOpenChange(false);
      },
      onError
    });
  });

  const pending = create.isPending || update.isPending;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Ubah SPPG" : "Tambah SPPG"}
      description="SPPG adalah titik keluar batch; koordinat dipakai perencana rute."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Nama" required error={form.formState.errors.nama?.message}>
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              invalid={control.invalid}
              required={control.required}
              {...form.register("nama")}
            />
          )}
        </Field>
        <Field label="Alamat" error={form.formState.errors.alamat?.message}>
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              invalid={control.invalid}
              {...form.register("alamat")}
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" required error={form.formState.errors.lat?.message}>
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                required={control.required}
                inputMode="decimal"
                className="font-mono"
                {...form.register("lat")}
              />
            )}
          </Field>
          <Field label="Longitude" required error={form.formState.errors.lng?.message}>
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                required={control.required}
                inputMode="decimal"
                className="font-mono"
                {...form.register("lng")}
              />
            )}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Porsi per hari" required error={form.formState.errors.porsiPerHari?.message}>
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                required={control.required}
                inputMode="numeric"
                className="font-mono"
                {...form.register("porsiPerHari")}
              />
            )}
          </Field>
          <Field
            label="Kapasitas olah (kg)"
            hint="Opsional."
            error={form.formState.errors.kapasitasOlahKg?.message}
          >
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                inputMode="decimal"
                className="font-mono"
                {...form.register("kapasitasOlahKg")}
              />
            )}
          </Field>
        </div>
        <Field label="Mitra" hint="Opsional." error={form.formState.errors.mitra?.message}>
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              invalid={control.invalid}
              {...form.register("mitra")}
            />
          )}
        </Field>
        {isEdit ? (
          <Checkbox
            label="SPPG aktif"
            checked={aktif}
            onChange={(event) => form.setValue("aktif", event.target.checked)}
          />
        ) : null}
        <Button type="submit" fullWidth loading={pending}>
          {isEdit ? "Simpan perubahan" : "Daftarkan SPPG"}
        </Button>
      </form>
    </Sheet>
  );
}
