import { memo } from "react";
import { LifeBuoyIcon } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";

interface RecoveryTriggerButtonProps {
  brokenFleetId: string;
  onTrigger: (brokenFleetId: string) => void;
  isTriggering: boolean;
  disabled?: boolean;
}

function RecoveryTriggerButtonInner({
  brokenFleetId,
  onTrigger,
  isTriggering,
  disabled,
}: RecoveryTriggerButtonProps) {
  return (
    <Button
      variant="destructive"
      onClick={() => onTrigger(brokenFleetId)}
      loading={isTriggering}
      disabled={disabled ?? isTriggering}
    >
      <LifeBuoyIcon className="h-4 w-4" />
      {isTriggering ? "Memproses..." : "Trigger Recovery"}
    </Button>
  );
}

export const RecoveryTriggerButton = memo(RecoveryTriggerButtonInner);
