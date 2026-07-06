import { z } from "zod";

export const createDestinationSchema = z.object({
  name: z.string().min(1, "Nama destinasi wajib diisi"),
  type: z.enum(["TPA", "RDF", "TPS_3R"], {
    message: "Pilih tipe destinasi yang valid",
  }),
  latitude: z
    .number()
    .min(-90, "Latitude minimal -90")
    .max(90, "Latitude maksimal 90"),
  longitude: z
    .number()
    .min(-180, "Longitude minimal -180")
    .max(180, "Longitude maksimal 180"),
  capacityKg: z.number().min(0, "Kapasitas minimal 0 kg"),
  priority: z
    .number()
    .int()
    .min(1, "Prioritas minimal 1")
    .max(5, "Prioritas maksimal 5")
    .optional(),
});

export type CreateDestinationFormValues = z.infer<
  typeof createDestinationSchema
>;
