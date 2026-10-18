import { z } from "zod";

const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

export const loginSchema = z.object({
  username: z
    .string({ error: "Isi nama pengguna." })
    .trim()
    .toLowerCase()
    .min(3, { error: "Nama pengguna minimal 3 karakter." })
    .max(32, { error: "Nama pengguna maksimal 32 karakter." })
    .regex(USERNAME_PATTERN, { error: "Hanya huruf, angka, titik, garis bawah, dan strip." }),
  password: z
    .string({ error: "Isi kata sandi." })
    .min(1, { error: "Isi kata sandi." })
    .max(72, { error: "Kata sandi maksimal 72 karakter." })
});

export type LoginPayload = z.infer<typeof loginSchema>;