import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { Button } from "../../components/Button";
import { useToast } from "../../components/ToastProvider";
import type { Activity } from "../../domain/types";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { ActivityRepository } from "../../db/repositories";
import { deleteActivity } from "./activityService";

const repository = new ActivityRepository(db);

export function DeleteActivityDialog({
  activity,
  open,
  onOpenChange,
}: {
  activity: Activity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { announce } = useToast();

  async function remove() {
    setPending(true);
    setError("");
    try {
      await deleteActivity(repository, activity.id);
      announce("Activity deleted. Progress has been recalculated.");
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
            Delete this activity?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted">
            “{activity.title}” will be removed and streaks, points, and targets
            will update immediately.
          </Dialog.Description>
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => void remove()}
            >
              {pending ? "Deleting..." : "Delete activity"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
