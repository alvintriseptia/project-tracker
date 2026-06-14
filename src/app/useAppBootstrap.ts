import { useCallback, useEffect, useState } from "react";

import { db } from "../db/database";
import { storageErrorMessage } from "../db/errors";
import { initializeDatabase } from "../db/initialize";

type BootstrapState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string };

export function useAppBootstrap() {
  const [state, setState] = useState<BootstrapState>({ status: "loading" });
  const retry = useCallback(() => {
    setState({ status: "loading" });
    void initializeDatabase(db)
      .then(() => setState({ status: "ready" }))
      .catch((error: unknown) =>
        setState({ status: "error", message: storageErrorMessage(error) }),
      );
  }, []);

  useEffect(() => {
    void initializeDatabase(db)
      .then(() => setState({ status: "ready" }))
      .catch((error: unknown) =>
        setState({ status: "error", message: storageErrorMessage(error) }),
      );
  }, []);
  return { state, retry };
}
