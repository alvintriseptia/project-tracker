import { Link } from "react-router-dom";

import { Button } from "../components/Button";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold">
        This page does not exist
      </h1>
      <p className="mt-3 text-muted">
        Return to Today and keep the challenge moving.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Go to Today</Link>
      </Button>
    </div>
  );
}
