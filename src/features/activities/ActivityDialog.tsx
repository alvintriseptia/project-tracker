import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "../../components/Button";
import { useToast } from "../../components/ToastProvider";
import type { Activity, LocalDate, Track } from "../../domain/types";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { ActivityRepository } from "../../db/repositories";
import { useDirtyForms } from "../../pwa/DirtyFormsProvider";
import type { ActivityFormValues } from "./activityFormSchema";
import { ActivityForm } from "./ActivityForm";
import { saveActivity } from "./activityService";

const repository = new ActivityRepository(db);

export type ActivityPrefill = {
  trackId?: string;
  title?: string;
};

export function ActivityDialog({
  open,
  onOpenChange,
  tracks,
  today,
  prefill,
  activity,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracks: Track[];
  today: LocalDate;
  prefill?: ActivityPrefill;
  activity?: Activity;
}) {
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const { announce } = useToast();
  const { setFormDirty } = useDirtyForms();

  const updateDirty = useCallback(
    (nextDirty: boolean) => {
      setDirty(nextDirty);
      setFormDirty("activity-dialog", nextDirty);
    },
    [setFormDirty],
  );

  async function submit(values: ActivityFormValues) {
    setError("");
    const track = tracks.find((candidate) => candidate.id === values.trackId);
    if (!track) {
      setError("The selected project is unavailable.");
      return;
    }
    try {
      await saveActivity({
        repository,
        values,
        track,
        ...(activity ? { existing: activity } : {}),
      });
      announce(activity ? "Activity updated." : "Activity completed.");
      setFormDirty("activity-dialog", false);
      onOpenChange(false);
    } catch (caught) {
      setError(storageErrorMessage(caught));
    }
  }

  function requestClose(nextOpen: boolean) {
    if (!nextOpen && dirty && !window.confirm("Discard unsaved changes?")) {
      return;
    }
    if (!nextOpen) setFormDirty("activity-dialog", false);
    onOpenChange(nextOpen);
  }

  return (
    <Dialog.Root open={open} onOpenChange={requestClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-3 top-[4vh] z-50 mx-auto max-h-[92vh] max-w-xl overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-2xl sm:top-1/2 sm:-translate-y-1/2 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-2xl font-semibold">
                {activity ? "Edit activity" : "Log completed action"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                Keep it brief. You can add detail only when it helps.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" aria-label="Close activity form">
                <X size={20} />
              </Button>
            </Dialog.Close>
          </div>
          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </div>
          ) : null}
          <ActivityForm
            key={`${activity?.id ?? "new"}-${prefill?.trackId ?? ""}-${prefill?.title ?? ""}`}
            tracks={tracks}
            today={today}
            {...(prefill?.trackId ? { initialTrackId: prefill.trackId } : {})}
            {...(prefill?.title ? { initialTitle: prefill.title } : {})}
            {...(activity ? { activity } : {})}
            onSubmit={submit}
            onDirtyChange={updateDirty}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
