import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { env } from "@/shared/lib/env";
import { loginResult } from "@/test/fixtures";

const API_URL = env.VITE_API_URL;
const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "benar";

export const handlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username?: string; password?: string };
    if (body.username === LOGIN_USERNAME && body.password === LOGIN_PASSWORD) {
      return HttpResponse.json({
        data: loginResult,
        timestamp: new Date().toISOString(),
        success: true
      });
    }
    return HttpResponse.json(
      {
        success: false,
        error: { code: "AUTH_INVALID", message: "Nama pengguna atau kata sandi salah" },
        timestamp: new Date().toISOString(),
        path: "/api/v1/auth/login"
      },
      { status: 401 }
    );
  })
];

export const server = setupServer(...handlers);