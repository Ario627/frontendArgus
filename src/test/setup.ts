import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { http } from "@/api/axios-client";
import { server } from "@/test/msw";

const mediaQueryList = {
  matches: false,
  media: "",
  onchange: null,
  addListener: () => undefined,
  removeListener: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  dispatchEvent: () => false
};

vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mediaQueryList));

http.defaults.adapter = "fetch";

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  sessionStorage.clear();
});

afterAll(() => {
  server.close();
});