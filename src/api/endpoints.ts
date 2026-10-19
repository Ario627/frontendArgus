export const endpoints = Object.freeze({
  auth: Object.freeze({
    login: "/auth/login",
    me: "/auth/me"
  }),
  health: "/health",
  sppg: Object.freeze({
    list: "/sppg",
    create: "/sppg",
    detail: (id: string) => `/sppg/${id}`,
    update: (id: string) => `/sppg/${id}`,
    addPoint: (id: string) => `/sppg/${id}/points`,
    updatePoint: (id: string, pointId: string) => `/sppg/${id}/points/${pointId}`
  }),
  facilities: Object.freeze({
    list: "/facilities",
    create: "/facilities",
    update: (id: string) => `/facilities/${id}`,
    profile: (id: string) => `/facilities/${id}/profile`,
    updateProfile: (id: string) => `/facilities/${id}/profile`,
    profileVersions: (id: string) => `/facilities/${id}/profile/versions`
  }),
  batches: Object.freeze({
    list: "/batches",
    create: "/batches",
    detail: (id: string) => `/batches/${id}`,
    gate: (id: string) => `/batches/${id}/gate`,
    disposition: (id: string) => `/batches/${id}/disposition`,
    strukLink: (id: string) => `/batches/${id}/struk-link`
  }),
  dispositions: Object.freeze({
    list: "/dispositions",
    run: "/dispositions/run"
  }),
  dispatch: Object.freeze({
    board: "/dispatch/board",
    assign: "/dispatch/assign",
    auto: "/dispatch/auto"
  }),
  ledger: Object.freeze({
    list: (batchId: string) => `/ledger/${batchId}`,
    append: (batchId: string) => `/ledger/${batchId}/events`,
    verify: (batchId: string) => `/ledger/${batchId}/verify`,
    confirmTransfer: (batchId: string) => `/ledger/${batchId}/transfer/confirm`,
    recent: "/ledger/recent"
  }),
  sync: Object.freeze({
    batch: "/sync/batch"
  }),
  routes: Object.freeze({
    list: "/routes",
    plan: "/routes/plan",
    detail: (id: string) => `/routes/${id}`,
    replan: (id: string) => `/routes/${id}/replan`,
    updateStop: (id: string, stopId: string) => `/routes/${id}/stops/${stopId}`
  }),
  menu: Object.freeze({
    items: "/menu/items",
    createItem: "/menu/items",
    servings: "/menu/servings",
    observations: "/menu/observations",
    insights: "/menu/insights"
  }),
  tickets: Object.freeze({
    list: "/tickets",
    detail: (id: string) => `/tickets/${id}`,
    verify: (id: string) => `/tickets/${id}/verify`,
    respond: (id: string) => `/tickets/${id}/respond`,
    close: (id: string) => `/tickets/${id}/close`
  }),
  public: Object.freeze({
    sppg: (slug: string) => `/public/sppg/${slug}`,
    photos: "/public/photos",
    tickets: "/public/tickets",
    struk: (token: string) => `/public/struk/${token}`
  }),
  dashboard: Object.freeze({
    summary: "/dashboard/summary",
    narrative: "/dashboard/narrative",
    impact: "/dashboard/impact"
  }),
  anomalies: Object.freeze({
    list: "/anomalies",
    close: (id: string) => `/anomalies/${id}/close`,
    digitScan: "/anomalies/digit-scan"
  }),
  export: Object.freeze({
    batchesCsv: "/export/batches.csv",
    batchesPdf: "/export/batches.pdf"
  }),
  parameters: Object.freeze({
    list: "/parameters",
    update: (key: string) => `/parameters/${key}`
  }),
  photos: Object.freeze({
    upload: "/photos",
    byHash: (sha256: string) => `/photos/${sha256}`
  }),
  fleet: Object.freeze({
    list: "/fleet",
    create: "/fleet",
    detail: (id: string) => `/fleet/${id}`,
    update: (id: string) => `/fleet/${id}`,
    positions: (id: string) => `/fleet/${id}/positions`
  }),
  devices: Object.freeze({
    list: "/devices",
    create: "/devices",
    detail: (id: string) => `/devices/${id}`,
    revoke: (id: string) => `/devices/${id}/revoke`,
    rotateSecret: (id: string) => `/devices/${id}/rotate-secret`
  }),
  telemetry: Object.freeze({
    latest: (fleetId: string) => `/telemetry/${fleetId}/latest`
  }),
  scale: Object.freeze({
    pendingList: "/scale/pending",
    pendingDetail: (id: string) => `/scale/pending/${id}`,
    link: (id: string) => `/scale/pending/${id}/link`
  }),
  chain: Object.freeze({
    verify: "/chain/verify"
  }),
  retention: Object.freeze({
    run: "/retention/run"
  }),
  audit: Object.freeze({
    list: "/audit"
  }),
  maps: Object.freeze({
    directions: "/maps/directions",
    route: "/maps/route"
  })
});