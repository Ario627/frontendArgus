import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { isApiError } from "@/api/api-error";
import { useCreateFleet, useUpdateFleet } from "@/features/fleet/hooks/use-fleet-mutations";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import type { FleetDto } from "@/shared/types/fleet.types";

const positiveOptional = z
  .string()
  .trim()
  .refine((value) => value === "" || (/^\d+(\.\d+)?$/.test(value) && Number(value) > 0), {
    message: "Isi angka positif atau kosongkan."
  });

const fleetSchema = z.object({
  kode: z.string().trim().min(2, "Kode minimal 2 karakter.").max(40, "Maksimal 40 karakter."),
  plat: z.string().trim().max(20, "Maksimal 20 karakter."),
  driverNama: z.string().trim().max(120, "Maksimal 120 karakter."),
  kapasitasKg: positiveOptional,
  aktif: z.boolean()
});

type FleetFormValues = z.infer<typeof fleetSchema>;

const toValues = (fleet: FleetDto | null): FleetFormValues => ({
  kode: fleet?.kode ?? "",
  plat: fleet?.plat ?? "",
  driverNama: fleet?.driverNama ?? "",
  kapasitasKg: fleet?.kapasitasKg === null || fleet === null ? "" : String(fleet.kapasitasKg),
  aktif: fleet?.aktif ?? true
});

export interface FleetFormSheetProps {
  readonly fleet: FleetDto | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function FleetFormSheet({ fleet, open, onOpenChange }: FleetFormSheetProps) {
  const create = useCreateFleet();
  const update = useUpdateFleet();
  const showToast = useToastStore((state) => state.show);
  const isEdit = fleet !== null;

  const form = useForm<FleetFormValues>({
    resolver: zodResolver(fleetSchema),
    mode: "onTouched",
    defaultValues: toValues(fleet)
  });

  const aktif = useWatch({ control: form.control, name: "aktif" });

  useEffect(() => {
    if (open) form.reset(toValues(fleet));
  }, [open, fleet, form]);

  const submit = form.handleSubmit((values) => {
    const payload = {
      kode: values.kode,
      plat: values.plat === "" ? null : values.plat,
      driverNama: values.driverNama === "" ? null : values.driverNama,
      kapasitasKg: values.kapasitasKg === "" ? null : Number(values.kapasitasKg)
    };

    const onError = (cause: unknown) => {
      showToast({
        message: isApiError(cause) ? cause.message : "Armada tidak dapat disimpan.",
        tone: "bata"
      });
    };

    if (isEdit) {
      update.mutate(
        { fleetId: fleet.id, input: { ...payload, aktif: values.aktif } },
        {
          onSuccess: () => {
            showToast({ message: "Perubahan armada tersimpan." });
            onOpenChange(false);
          },
          onError
        }
      );
      return;
    }

    create.mutate(
      {
        kode: payload.kode,
        ...(payload.plat === null ? {} : { plat: payload.plat }),
        ...(payload.driverNama === null ? {} : { driverNama: payload.driverNama }),
        ...(payload.kapasitasKg === null ? {} : { kapasitasKg: payload.kapasitasKg })
      },
      {
        onSuccess: () => {
          showToast({ message: "Armada terdaftar." });
          onOpenChange(false);
        },
        onError
      }
    );
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Ubah armada" : "Tambah armada"}
      description="Kapasitas dipakai perencana rute; kode tampil di manifest pengemudi."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Kode armada" required error={form.formState.errors.kode?.message}>
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              invalid={control.invalid}
              required={control.required}
              className="font-mono"
              placeholder="ARM-01"
              {...form.register("kode")}
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Plat" error={form.formState.errors.plat?.message}>
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                className="font-mono"
                {...form.register("plat")}
              />
            )}
          </Field>
          <Field label="Kapasitas (kg)" error={form.formState.errors.kapasitasKg?.message}>
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                inputMode="decimal"
                className="font-mono"
                {...form.register("kapasitasKg")}
              />
            )}
          </Field>
        </div>
        <Field label="Nama pengemudi" error={form.formState.errors.driverNama?.message}>
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              invalid={control.invalid}
              {...form.register("driverNama")}
            />
          )}
        </Field>
        {isEdit ? (
          <Checkbox
            label="Armada aktif"
            checked={aktif}
            onChange={(event) => form.setValue("aktif", event.target.checked)}
          />
        ) : null}
        <Button type="submit" fullWidth loading={create.isPending || update.isPending}>
          {isEdit ? "Simpan perubahan" : "Daftarkan armada"}
        </Button>
      </form>
    </Sheet>
  );
}
