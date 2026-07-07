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
  capacityKg: z.coerce.number(),
});

export type CreateFleetFormValues = z.infer<typeof createFleetSchema>;
