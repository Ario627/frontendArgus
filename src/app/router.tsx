import { createBrowserRouter } from "react-router";
import { RouteError } from "@/app/error-boundary";
import { NotFoundPage } from "@/app/not-found-page";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { RequireRole } from "@/features/auth/components/require-role";
import { LoginPage } from "@/features/auth/pages/login-page";
import { ConsoleLayout } from "@/shared/components/layout/console-layout";
import { FieldLayout } from "@/shared/components/layout/field-layout";
import { PublicLayout } from "@/shared/components/layout/public-layout";
import { CAPTURE_ROLES, CONSOLE_ROLES, FIELD_ROLES } from "@/shared/constants/roles.constant";

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => ({
      Component: (await import("@/features/landing/pages/root-page")).RootPage
    }),
    errorElement: <RouteError />
  },
  { path: "/login", element: <LoginPage />, errorElement: <RouteError /> },
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <RequireRole roles={CAPTURE_ROLES} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <FieldLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/catat",
                lazy: async () => ({
                  Component: (await import("@/features/field-capture/pages/capture-page")).CapturePage
                })
              }
            ]
          }
        ]
      },
      {
        element: <RequireRole roles={FIELD_ROLES} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <FieldLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/antrean",
                lazy: async () => ({
                  Component: (await import("@/features/outbox/pages/outbox-page")).OutboxPage
                })
              }
            ]
          }
        ]
      },
      {
        element: <RequireRole roles={["facility"]} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <FieldLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/fasilitas-masuk",
                lazy: async () => ({
                  Component: (await import("@/features/facility/pages/incoming-page")).IncomingPage
                })
              }
            ]
          }
        ]
      },
      {
        element: <RequireRole roles={["driver"]} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <FieldLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/rute-hari-ini",
                lazy: async () => ({
                  Component: (await import("@/features/routes/pages/driver-route-page")).DriverRoutePage
                })
              }
            ]
          }
        ]
      },
      {
        element: <RequireRole roles={CONSOLE_ROLES} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <ConsoleLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/batches",
                lazy: async () => ({
                  Component: (await import("@/features/batch/pages/batches-page")).BatchesPage
                })
              },
              {
                path: "/batches/:batchId",
                lazy: async () => ({
                  Component: (await import("@/features/batch/pages/batch-detail-page")).BatchDetailPage
                })
              },
              {
                path: "/ledger",
                lazy: async () => ({
                  Component: (await import("@/features/ledger/pages/ledger-recent-page")).LedgerRecentPage
                })
              },
              {
                path: "/anomalies",
                lazy: async () => ({
                  Component: (await import("@/features/anomalies/pages/anomalies-page")).AnomaliesPage
                })
              },
              {
                path: "/audit",
                lazy: async () => ({
                  Component: (await import("@/features/audit/pages/audit-page")).AuditPage
                })
              },
              {
                path: "/facilities",
                lazy: async () => ({
                  Component: (await import("@/features/facilities/pages/facilities-page")).FacilitiesPage
                })
              },
              {
                path: "/dispositions",
                lazy: async () => ({
                  Component: (await import("@/features/disposition/pages/dispositions-page")).DispositionsPage
                })
              },
              {
                path: "/menu",
                lazy: async () => ({
                  Component: (await import("@/features/menu/pages/menu-page")).MenuPage
                })
              },
              {
                path: "/tickets",
                lazy: async () => ({
                  Component: (await import("@/features/tickets/pages/tickets-page")).TicketsPage
                })
              },
              {
                path: "/tickets/:ticketId",
                lazy: async () => ({
                  Component: (await import("@/features/tickets/pages/ticket-detail-page")).TicketDetailPage
                })
              },
              {
                path: "/routes",
                lazy: async () => ({
                  Component: (await import("@/features/routes/pages/routes-page")).RoutesPage
                })
              },
              {
                path: "/routes/:planId",
                lazy: async () => ({
                  Component: (await import("@/features/routes/pages/route-detail-page")).RouteDetailPage
                })
              },
              {
                path: "/export",
                lazy: async () => ({
                  Component: (await import("@/features/export/pages/export-page")).ExportPage
                })
              },
              {
                path: "/fleet",
                lazy: async () => ({
                  Component: (await import("@/features/fleet/pages/fleet-page")).FleetPage
                })
              },
              {
                path: "/parameters",
                lazy: async () => ({
                  Component: (await import("@/features/parameters/pages/parameters-page")).ParametersPage
                })
              },
              {
                path: "/dashboard",
                lazy: async () => ({
                  Component: (await import("@/features/dashboard/pages/dashboard-page")).DashboardPage
                })
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: "/lapor",
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: ":slug",
        lazy: async () => ({
          Component: (await import("@/features/public-report/pages/public-report-page")).PublicReportPage
        })
      }
    ]
  },
  {
    path: "/struk",
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: ":token",
        lazy: async () => ({
          Component: (await import("@/features/public-receipt/pages/public-receipt-page")).PublicReceiptPage
        })
      }
    ]
  },
  { path: "*", element: <NotFoundPage />, errorElement: <RouteError /> }
]);