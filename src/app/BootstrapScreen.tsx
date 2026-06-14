import { Database, RefreshCw } from "lucide-react";

import { Button } from "../components/Button";

export function BootstrapScreen({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6 text-ink">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-white">
          {error ? <Database size={26} /> : <RefreshCw className="animate-spin" />}
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold">
          {error ? "Local storage could not start" : "Preparing No Zero"}
        </h1>
        <p className="mt-2 text-muted">
          {error ??
            "Creating your private local tracker and default project tracks."}
        </p>
        {onRetry ? (
          <Button className="mt-5" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    </main>
  );
}
