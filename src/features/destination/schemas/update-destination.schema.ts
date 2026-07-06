import { z } from "zod";
import { createDestinationSchema } from "./create-destination.schema";

export const updateDestinationSchema = createDestinationSchema.partial();

export type UpdateDestinationFormValues = z.infer<
  typeof updateDestinationSchema
>;
