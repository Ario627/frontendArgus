import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { AppErrorBoundary } from "@/app/error-boundary";
import { ConfigErrorScreen } from "@/app/config-error-screen";
import { queryClient } from "@/app/query-client";
import { router } from "@/app/router";
import { registerSessionCleanup } from "@/features/auth/store/auth.store";
import { ToastViewport } from "@/shared/components/ui/toast";
import { envIsValid, envIssues } from "@/shared/lib/env";

registerSessionCleanup(() => {
  queryClient.clear();
});

export function AppProviders() {
  if (!envIsValid) return <ConfigErrorScreen issues={envIssues} />;

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
      <ToastViewport />
    </AppErrorBoundary>
  );
}