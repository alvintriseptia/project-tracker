import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "../components/Button";

type State = { error?: Error };

export class AppErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route render failed", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-canvas p-6">
          <div className="max-w-lg text-center">
            <AlertTriangle className="mx-auto text-danger" size={40} />
            <h1 className="mt-4 font-display text-3xl font-semibold">
              This screen could not render
            </h1>
            <p className="mt-2 text-muted">
              Your local data is unchanged. Reload the screen to try again.
            </p>
            <Button className="mt-5" onClick={() => window.location.reload()}>
              Reload application
            </Button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
