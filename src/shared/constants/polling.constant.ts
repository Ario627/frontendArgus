import { env } from "../../lib/env"
export const POLLING_INTERVALS = Object.freeze({
  fleetPositions: env.VITE_POLL_FLEET_POSITIONS_MS,
  dashboardSummary: env.VITE_POLL_DASHBOARD_SUMMARY_MS,
  health: env.VITE_POLL_HEALTH_MS,
})

export const LIVENESS_THRESHOLDS = Object.freeze({
  staleSeconds: env.VITE_STALE_THRESHOLD_SECONDS,
  offlineSeconds: env.VITE_OFFLINE_THRESHOLD_SECONDS,
})
