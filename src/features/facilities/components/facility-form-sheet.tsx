import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { isApiError } from "@/api/api-error";
import {
  useCreateFacility,
  useUpdateFacility
} from "@/features/facilities/hooks/use-facility-mutations";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { FACILITY_KINDS, FACILITY_KIND_LABELS, FACILITY_LEVELS } from "@/shared/types/facility.types";
import type { FacilityDto } from "@/shared/types/facility.types";

const decimalOptional = z
  .string()
  .trim()
  .refine((value) => value === "" || (/^\d+(\.\d+)?$/.test(value) && Number(value) > 0), {
    message: "Isi angka positif atau kosongkan."
  });

const hoursOptional = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(value), {
    message: "Format HH:MM-HH:MM."
  });

const facilitySchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120, "Maksimal 120 karakter."),
  tingkat: z.enum(FACILITY_LEVELS),
  jenis: z.enum(FACILITY_KINDS),
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
  kapasitasKgHari: decimalOptional,
  jamOperasi: hoursOptional,
  mitra: z.boolean(),
  aktif: z.boolean()
});

type FacilityFormValues = z.infer<typeof facilitySchema>;

const toValues = (facility: FacilityDto | null): FacilityFormValues => ({
  nama: facility?.nama ?? "",
  tingkat: facility?.tingkat ?? "T1",
  jenis: facility?.jenis ?? "komposter",
  lat: facility === null ? "" : String(facility.lat),
  lng: facility === null ? "" : String(facility.lng),
  kapasitasKgHari:
    facility?.kapasitasKgHari === null || facility === null ? "" : String(facility.kapasitasKgHari),
  jamOperasi: facility?.jamOperasi ?? "",
  mitra: facility?.mitra ?? false,
  aktif: facility?.aktif ?? true
});

export interface FacilityFormSheetProps {
  readonly facility: FacilityDto | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function FacilityFormSheet({ facility, open, onOpenChange }: FacilityFormSheetProps) {
  const create = useCreateFacility();
  const update = useUpdateFacility();
  const showToast = useToastStore((state) => state.show);
  const isEdit = facility !== null;

  const form = useForm<FacilityFormValues>({
    resolver: zodResolver(facilitySchema),
    mode: "onTouched",
    defaultValues: toValues(facility)
  });

  const mitra = useWatch({ control: form.control, name: "mitra" });
  const aktif = useWatch({ control: form.control, name: "aktif" });

  useEffect(() => {
    if (open) form.reset(toValues(facility));
  }, [open, facility, form]);

  const submit = form.handleSubmit((values) => {
    const payload = {
      nama: values.nama,
      tingkat: values.tingkat,
      jenis: values.jenis,
      lat: Number(values.lat),
      lng: Number(values.lng),
      kapasitasKgHari: values.kapasitasKgHari === "" ? null : Number(values.kapasitasKgHari),
      jamOperasi: values.jamOperasi === "" ? null : values.jamOperasi,
      mitra: values.mitra,
      aktif: values.aktif
    };

    const onError = (cause: unknown) => {
      showToast({
        message: isApiError(cause) ? cause.message : "Fasilitas tidak dapat disimpan.",
        tone: "bata"
      });
    };

    if (isEdit) {
      update.mutate(
        { facilityId: facility.id, input: payload },
        {
          onSuccess: () => {
            showToast({ message: "Perubahan fasilitas tersimpan." });
            onOpenChange(false);
          },
          onError
        }
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        showToast({ message: "Fasilitas terdaftar. Isi profil penerimaannya." });
        onOpenChange(false);
      },
      onError
    });
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Ubah fasilitas" : "Tambah fasilitas"}
      description="Koordinat dan kapasitas dipakai gerbang putusan dan perencanaan rute."
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tingkat" required error={form.formState.errors.tingkat?.message}>
            {(control) => (
              <Select
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                {...form.register("tingkat")}
              >
                {FACILITY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Jenis" required error={form.formState.errors.jenis?.message}>
            {(control) => (
              <Select
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                {...form.register("jenis")}
              >
                {FACILITY_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {FACILITY_KIND_LABELS[kind]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

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
          <Field
            label="Kapasitas (kg/hari)"
            hint="Opsional."
            error={form.formState.errors.kapasitasKgHari?.message}
          >
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                inputMode="decimal"
                className="font-mono"
                {...form.register("kapasitasKgHari")}
              />
            )}
          </Field>
          <Field
            label="Jam operasi"
            hint="HH:MM-HH:MM"
            error={form.formState.errors.jamOperasi?.message}
          >
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                className="font-mono"
                placeholder="08:00-16:00"
                {...form.register("jamOperasi")}
              />
            )}
          </Field>
        </div>

        <Checkbox
          label="Mitra resmi"
          checked={mitra}
          onChange={(event) => form.setValue("mitra", event.target.checked)}
        />
        <Checkbox
          label="Fasilitas aktif"
          checked={aktif}
          onChange={(event) => form.setValue("aktif", event.target.checked)}
        />

        <Button type="submit" fullWidth loading={create.isPending || update.isPending}>
          {isEdit ? "Simpan perubahan" : "Daftarkan fasilitas"}
        </Button>
      </form>
    </Sheet>
  );
}
