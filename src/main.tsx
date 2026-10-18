import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { AppProviders } from "@/app/providers";
import "@/shared/styles/index.css";

registerSW({ immediate: true });

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Elemen #root tidak ditemukan di index.html");
}

createRoot(container).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);