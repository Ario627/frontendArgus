import { z } from "zod";

export const recoveryAssignSchema = z.object({
  brokenFleetId: z.string().min(1, "ID truk rusak wajib diisi"),
  receivingFleetIds: z
    .array(z.string())
    .min(1, "Pilih minimal 1 truk penerima"),
  redistributedStopIds: z
    .array(z.string())
    .min(1, "Pilih minimal 1 stop untuk didistribusi ulang"),
});

export type RecoveryAssignFormValues = z.infer<typeof recoveryAssignSchema>;
