import { z } from "zod";
import { createFleetSchema } from "./create-fleet.schema";

export const updateFleetSchema = createFleetSchema
  .omit({ plateNumber: true })
  .partial();

export type UpdateFleetFormValues = z.infer<typeof updateFleetSchema>;
