import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { isApiError } from "@/api/api-error";
import { useCreateDevice } from "@/features/devices/hooks/use-device-mutations";
import { DeviceProvisioningPanel } from "@/features/devices/components/device-provisioning-panel";
import { useFleetList } from "@/features/fleet/hooks/use-fleet-list";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { DEVICE_TYPES, DEVICE_TYPE_LABELS } from "@/shared/constants/device.constant";
import type { DeviceCreatedDto } from "@/shared/types/device.types";

const deviceSchema = z
  .object({
    tipe: z.enum(DEVICE_TYPES),
    fleetId: z.string().trim(),
    sppgId: z.string().trim(),
    firmware: z.string().trim().max(120, "Maksimal 120 karakter.")
  })
  .superRefine((value, context) => {
    if (value.tipe === "tracker" && value.fleetId.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["fleetId"],
        message: "Pelacak wajib terikat ke satu armada."
      });
    }
    if (value.tipe === "timbangan" && value.sppgId.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["sppgId"],
        message: "Timbangan wajib terikat ke satu SPPG."
      });
    }
  });

type DeviceFormValues = z.infer<typeof deviceSchema>;

export interface CreateDeviceSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function CreateDeviceSheet({ open, onOpenChange }: CreateDeviceSheetProps) {
  const fleets = useFleetList({ aktif: true });
  const sppgList = useSppgList();
  const mutation = useCreateDevice();
  const showToast = useToastStore((state) => state.show);

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    mode: "onTouched",
    defaultValues: { tipe: "tracker", fleetId: "", sppgId: "", firmware: "" }
  });

  const tipe = useWatch({ control: form.control, name: "tipe" });
  const created: DeviceCreatedDto | null = mutation.data ?? null;

  const close = () => {
    onOpenChange(false);
    mutation.reset();
    form.reset();
  };

  const submit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        tipe: values.tipe,
        ...(values.tipe === "tracker" ? { fleetId: values.fleetId } : { sppgId: values.sppgId }),
        ...(values.firmware.length === 0 ? {} : { firmware: values.firmware })
      },
      {
        onSuccess: () => {
          showToast({ message: "Perangkat terdaftar. Catat kredensialnya sekarang." });
        },
        onError: (cause) => {
          showToast({
            message: isApiError(cause) ? cause.message : "Perangkat tidak dapat didaftarkan.",
            tone: "bata"
          });
        }
      }
    );
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
        else onOpenChange(true);
      }}
      title="Daftarkan perangkat"
      description="Pelacak untuk armada, timbangan untuk SPPG. Kredensial MQTT dibuat otomatis."
    >
      {created === null ? (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Field label="Tipe perangkat" required error={form.formState.errors.tipe?.message}>
            {(control) => (
              <Select
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                {...form.register("tipe")}
              >
                {DEVICE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {DEVICE_TYPE_LABELS[value]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          {tipe === "tracker" ? (
            <Field label="Armada" required error={form.formState.errors.fleetId?.message}>
              {(control) => (
                <Select
                  id={control.id}
                  aria-describedby={control.describedBy}
                  invalid={control.invalid}
                  {...form.register("fleetId")}
                >
                  <option value="">Pilih armada</option>
                  {(fleets.data?.items ?? []).map((fleet) => (
                    <option key={fleet.id} value={fleet.id}>
                      {fleet.kode}
                      {fleet.plat === null ? "" : ` · ${fleet.plat}`}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          ) : (
            <Field label="SPPG" required error={form.formState.errors.sppgId?.message}>
              {(control) => (
                <Select
                  id={control.id}
                  aria-describedby={control.describedBy}
                  invalid={control.invalid}
                  {...form.register("sppgId")}
                >
                  <option value="">Pilih SPPG</option>
                  {(sppgList.data?.items ?? []).map((sppg) => (
                    <option key={sppg.id} value={sppg.id}>
                      {sppg.nama}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}

          <Field
            label="Firmware"
            hint="Opsional. Nama atau versi firmware yang terpasang."
            error={form.formState.errors.firmware?.message}
          >
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                {...form.register("firmware")}
              />
            )}
          </Field>

          <Button type="submit" fullWidth loading={mutation.isPending}>
            Daftarkan
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <DeviceProvisioningPanel provisioning={created.provisioning} />
          <Button variant="secondary" fullWidth onClick={close}>
            Sudah kucatat, tutup
          </Button>
        </div>
      )}
    </Sheet>
  );
}
