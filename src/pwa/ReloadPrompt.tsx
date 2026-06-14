import { useRegisterSW } from "virtual:pwa-register/react";

import { Button } from "../components/Button";
import { useDirtyForms } from "./DirtyFormsProvider";

export function ReloadPrompt() {
  const { hasDirtyForms } = useDirtyForms();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[60] w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-4 shadow-2xl lg:bottom-4">
      <p className="font-semibold">A new version is ready</p>
      <p className="mt-1 text-sm text-muted">
        {hasDirtyForms
          ? "Finish or discard your open form before refreshing."
          : "Refresh to load the latest application files."}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setNeedRefresh(false)}>
          Later
        </Button>
        <Button
          size="sm"
          disabled={hasDirtyForms}
          onClick={() => void updateServiceWorker(true)}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
