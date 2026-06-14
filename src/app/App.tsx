import { RouterProvider } from "react-router-dom";

import { ToastProvider } from "../components/ToastProvider";
import { DirtyFormsProvider } from "../pwa/DirtyFormsProvider";
import { OfflineStatus } from "../pwa/OfflineStatus";
import { ReloadPrompt } from "../pwa/ReloadPrompt";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { BootstrapScreen } from "./BootstrapScreen";
import { router } from "./router";
import { useAppBootstrap } from "./useAppBootstrap";

export function App() {
  const { state, retry } = useAppBootstrap();

  if (state.status === "loading") {
    return <BootstrapScreen />;
  }
  if (state.status === "error") {
    return <BootstrapScreen error={state.message} onRetry={retry} />;
  }

  return (
    <AppErrorBoundary>
      <DirtyFormsProvider>
        <ToastProvider>
          <OfflineStatus />
          <RouterProvider router={router} />
          <ReloadPrompt />
        </ToastProvider>
      </DirtyFormsProvider>
    </AppErrorBoundary>
  );
}
