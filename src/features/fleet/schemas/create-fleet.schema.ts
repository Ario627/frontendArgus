import { z } from "zod";

export const createFleetSchema = z.object({
  plateNumber: z
    .string()
    .regex(
      /^[A-Z0-9-]{3,12}$/,
      "Format: huruf besar/angka/strip, 3-12 karakter",
    ),
  driverName: z.string().min(1, "Nama sopir wajib diisi"),
  driverContact: z.string().optional(),
  capacityKg: z.number().min(0, "Kapasitas minimal 0 kg"),
});

export type CreateFleetFormValues = z.infer<typeof createFleetSchema>;
