import { z } from "zod";
import { USER_ROLES } from "@/shared/constants/roles.constant";
import type { UserProfile } from "@/shared/types/auth.types";

export const userProfileSchema: z.ZodType<UserProfile> = z.object({
  id: z.uuid(),
  username: z.string().min(1),
  nama: z.string().min(1),
  role: z.enum(USER_ROLES),
  sppgId: z.uuid().nullable(),
  facilityId: z.uuid().nullable(),
  fleetId: z.uuid().nullable()
});