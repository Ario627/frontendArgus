import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_MAP_TILE_URL: z.string().url(),
  VITE_MAP_TILE_ATTRIBUTION: z.string().min(1),
  VITE_POLL_FLEET_POSITIONS_MS: z.coerce.number().int().positive(),
  VITE_POLL_DASHBOARD_SUMMARY_MS: z.coerce.number().int().positive(),
  VITE_POLL_HEALTH_MS: z.coerce.number().int().positive(),
  VITE_STALE_THRESHOLD_SECONDS: z.coerce.number().int().positive(),
  VITE_OFFLINE_THRESHOLD_SECONDS: z.coerce.number().int().positive(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables. Check .env file.");
}

export const env = parsed.data;
