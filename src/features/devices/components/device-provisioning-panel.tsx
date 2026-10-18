import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import type { DeviceProvisioningDto } from "@/shared/types/device.types";

function CopyRow({ label, value }: { readonly label: string; readonly value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-garis py-2 last:border-b-0">
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-ink-lemah">{label}</span>
        <span className="truncate font-mono text-sm text-ink">{value}</span>
      </div>
      <Button variant="secondary" size="sm" onClick={copy}>
        {copied ? "Tersalin" : "Salin"}
      </Button>
    </div>
  );
}

export interface DeviceProvisioningPanelProps {
  readonly provisioning: DeviceProvisioningDto;
  readonly context?: string;
}

export function DeviceProvisioningPanel({
  provisioning,
  context = "Kredensial hanya tampil sekali. Catat sekarang sebelum menutup panel."
}: DeviceProvisioningPanelProps) {
  return (
    <div className="rounded-kontainer border border-kunyit/50 bg-kunyit/5 px-3 py-2">
      <p className="text-sm text-ink">{context}</p>
      <div className="mt-2">
        <CopyRow label="Username MQTT" value={provisioning.mqttUsername} />
        <CopyRow label="Password MQTT" value={provisioning.mqttPassword} />
        {provisioning.deviceSecret === null ? null : (
          <CopyRow label="Secret perangkat" value={provisioning.deviceSecret} />
        )}
      </div>
    </div>
  );
}
