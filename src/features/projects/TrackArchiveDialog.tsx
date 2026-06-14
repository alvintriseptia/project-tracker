import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { Button } from "../../components/Button";
import { useToast } from "../../components/ToastProvider";
import type { Track } from "../../domain/types";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { TrackRepository } from "../../db/repositories";
import { setTrackStatus } from "./trackService";

const repository = new TrackRepository(db);

export function TrackArchiveDialog({
  track,
  open,
  onOpenChange,
}: {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const { announce } = useToast();

  async function archive() {
    setPending(true);
    setError("");
    try {
      await setTrackStatus({ repository, track, status: "archived" });
      announce(`${track.name} archived. Its history is preserved.`);
      onOpenChange(false);
    } catch (caught) {
      setError(storageErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-2xl font-semibold">
            Archive {track.name}?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted">
            It will leave quick add and target prompts. Existing history remains
            available and still contributes to historical calculations.
          </Dialog.Description>
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => void archive()}
            >
              {pending ? "Archiving..." : "Archive project"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
