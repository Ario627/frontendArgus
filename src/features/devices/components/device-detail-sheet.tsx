import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { DeviceProvisioningPanel } from "@/features/devices/components/device-provisioning-panel";
import {
  useRevokeDevice,
  useRotateDeviceSecret
} from "@/features/devices/hooks/use-device-mutations";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/dialog";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { DEVICE_TYPE_LABELS } from "@/shared/constants/device.constant";
import { formatMoment } from "@/shared/lib/format";
import type { DeviceDto } from "@/shared/types/device.types";

function DetailRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-garis py-2 last:border-b-0">
      <span className="text-sm text-ink-lemah">{label}</span>
      <span className="text-right font-mono text-sm text-ink">{value}</span>
    </div>
  );
}

export interface DeviceDetailSheetProps {
  readonly device: DeviceDto | null;
  readonly onOpenChange: (open: boolean) => void;
}

export function DeviceDetailSheet({ device, onOpenChange }: DeviceDetailSheetProps) {
  const rotate = useRotateDeviceSecret();
  const revoke = useRevokeDevice();
  const showToast = useToastStore((state) => state.show);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [rotated, setRotated] = useState<{
    readonly mqttUsername: string;
    readonly mqttPassword: string;
    readonly deviceSecret: string | null;
  } | null>(null);
  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);

  if (device !== null && device.id !== lastDeviceId) {
    setLastDeviceId(device.id);
    setRotated(null);
  }
  if (device === null && lastDeviceId !== null) {
    setLastDeviceId(null);
    setRotated(null);
  }

  const targetLabel =
    device?.fleetId != null
      ? `armada ${device.fleetId.slice(0, 8)}`
      : device?.sppgId != null
        ? `sppg ${device.sppgId.slice(0, 8)}`
        : "tanpa target";

  const handleRotate = () => {
    if (device === null) return;
    setConfirmRotate(false);
    rotate.mutate(device.id, {
      onSuccess: (result) => {
        setRotated(result.provisioning);
        showToast({ message: "Secret baru dibuat. Kredensial lama tidak berlaku." });
      },
      onError: (cause) => {
        showToast({
          message: isApiError(cause) ? cause.message : "Secret tidak dapat diputar.",
          tone: "bata"
        });
      }
    });
  };

  const handleRevoke = () => {
    if (device === null) return;
    revoke.mutate(device.id, {
      onSuccess: () => {
        setRevokeOpen(false);
        showToast({ message: "Perangkat dicabut. Koneksi MQTT ditolak setelah tercabut." });
        onOpenChange(false);
      },
      onError: (cause) => {
        showToast({
          message: isApiError(cause) ? cause.message : "Perangkat tidak dapat dicabut.",
          tone: "bata"
        });
      }
    });
  };

  return (
    <Sheet
      open={device !== null}
      onOpenChange={onOpenChange}
      title="Detail perangkat"
      description="Identitas MQTT, target, dan riwayat kontak terakhir."
    >
      {device === null ? null : (
        <div className="flex flex-col gap-5">
          <div>
            <DetailRow label="Username" value={device.mqttUsername} />
            <DetailRow label="Tipe" value={DEVICE_TYPE_LABELS[device.tipe]} />
            <DetailRow label="Target" value={targetLabel} />
            <DetailRow label="Firmware" value={device.firmware ?? "belum dilaporkan"} />
            <DetailRow
              label="Terakhir aktif"
              value={device.lastSeenAt === null ? "belum pernah" : formatMoment(device.lastSeenAt)}
            />
            <DetailRow
              label="Timbangan terakhir"
              value={device.lastWeightAt === null ? "belum ada" : formatMoment(device.lastWeightAt)}
            />
            <DetailRow label="Status" value={device.aktif ? "aktif" : "dicabut"} />
          </div>

          {rotated === null ? null : (
            <DeviceProvisioningPanel
              provisioning={rotated}
              context="Secret baru hanya tampil sekali. Perbarui konfigurasi perangkat sekarang."
            />
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              fullWidth
              disabled={!device.aktif || rotate.isPending}
              onClick={() => setConfirmRotate(true)}
            >
              Putar secret MQTT
            </Button>
            <Button
              variant="danger"
              fullWidth
              disabled={!device.aktif || revoke.isPending}
              onClick={() => setRevokeOpen(true)}
            >
              Cabut perangkat
            </Button>
          </div>

          <p className="text-xs text-ink-lemah">
            Perangkat yang dicabut menolak koneksi baru, tetapi riwayat data tetap tersimpan di
            buku besar.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={confirmRotate}
        onOpenChange={setConfirmRotate}
        title="Putar secret MQTT?"
        description="Kredensial lama langsung tidak berlaku. Perangkat harus dikonfigurasi ulang dengan secret baru."
        confirmLabel="Putar sekarang"
        onConfirm={handleRotate}
      />

      <ConfirmDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Cabut perangkat?"
        description="Tindakan ini tercatat di jejak audit dan sulit dibatalkan. Ketik username perangkat untuk konfirmasi."
        confirmLabel="Cabut perangkat"
        tone="bahaya"
        typedWord={device?.mqttUsername}
        pending={revoke.isPending}
        onConfirm={handleRevoke}
      />
    </Sheet>
  );
}
