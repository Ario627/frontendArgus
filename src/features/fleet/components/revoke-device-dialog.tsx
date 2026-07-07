import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import type { Fleet } from "../../../shared/types/fleet.types";

interface RevokeDeviceDialogProps {
  open: boolean;
  fleet: Fleet | null;
  onConfirm: () => void;
  onCancel: () => void;
  isRevoking: boolean;
}

export function RevokeDeviceDialog({
  open,
  fleet,
  onConfirm,
  onCancel,
  isRevoking,
}: RevokeDeviceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Cabut Perangkat</DialogTitle>
          <DialogDescription>
            {fleet && (
              <>
                Yakin ingin mencabut perangkat IoT untuk armada{" "}
                <span className="font-medium text-foreground">
                  {fleet.plateNumber}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isRevoking}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={isRevoking}
          >
            Cabut Perangkat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}