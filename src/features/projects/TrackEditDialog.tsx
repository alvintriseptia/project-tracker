import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../components/Button";
import { useToast } from "../../components/ToastProvider";
import type { Track } from "../../domain/types";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { TrackRepository } from "../../db/repositories";
import { useDirtyForms } from "../../pwa/DirtyFormsProvider";
import {
  trackFormSchema,
  type TrackFormInput,
  type TrackFormValues,
} from "./trackFormSchema";
import { updateTrack } from "./trackService";

const repository = new TrackRepository(db);

export function TrackEditDialog({
  track,
  open,
  onOpenChange,
}: {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [error, setError] = useState("");
  const { announce } = useToast();
  const { setFormDirty } = useDirtyForms();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TrackFormInput, unknown, TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    mode: "onBlur",
    defaultValues: {
      name: track.name,
      description: track.description,
      color: track.color,
      defaultPoints: track.defaultPoints,
      weeklyTarget: track.weeklyTarget,
      minimumAction: track.minimumAction,
      normalAction: track.normalAction,
      strongAction: track.strongAction,
      endOfYearGoal: track.endOfYearGoal ?? "",
      countsTowardNoZero: track.countsTowardNoZero,
    },
  });

  async function submit(values: TrackFormValues) {
    setError("");
    try {
      await updateTrack({ repository, track, values });
      setFormDirty("track-edit-dialog", false);
      announce(`${values.name} settings updated.`);
      onOpenChange(false);
    } catch (caught) {
      setError(storageErrorMessage(caught));
    }
  }

  function requestClose(nextOpen: boolean) {
    if (!nextOpen && isDirty && !window.confirm("Discard project changes?")) {
      return;
    }
    if (!nextOpen) setFormDirty("track-edit-dialog", false);
    onOpenChange(nextOpen);
  }

  useEffect(() => {
    setFormDirty("track-edit-dialog", isDirty && open);
    return () => setFormDirty("track-edit-dialog", false);
  }, [isDirty, open, setFormDirty]);

  return (
    <Dialog.Root open={open} onOpenChange={requestClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/45" />
        <Dialog.Content className="fixed inset-x-3 top-[3vh] z-50 mx-auto max-h-[94vh] max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:top-1/2 sm:-translate-y-1/2">
          <Dialog.Title className="font-display text-2xl font-semibold">
            Edit {track.name}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted">
            Changes affect future defaults. Existing activity points stay intact.
          </Dialog.Description>
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => void handleSubmit(submit)(event)}
          >
            <div>
              <label className="field-label" htmlFor="track-name">
                Name
              </label>
              <input id="track-name" className="field-control" {...register("name")} />
              {errors.name ? (
                <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <label className="field-label" htmlFor="track-color">
                Color
              </label>
              <input
                id="track-color"
                type="color"
                className="field-control p-1"
                {...register("color")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="track-description">
                Description
              </label>
              <input
                id="track-description"
                className="field-control"
                {...register("description")}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="track-points">
                Default points
              </label>
              <input
                id="track-points"
                type="number"
                min="0"
                className="field-control"
                {...register("defaultPoints")}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="track-target">
                Weekly target
              </label>
              <input
                id="track-target"
                type="number"
                min="0"
                className="field-control"
                {...register("weeklyTarget")}
              />
            </div>
            {[
              ["minimumAction", "Minimum action"],
              ["normalAction", "Normal action"],
              ["strongAction", "Strong action"],
            ].map(([field, label]) => (
              <div className="sm:col-span-2" key={field}>
                <label className="field-label" htmlFor={`track-${field}`}>
                  {label}
                </label>
                <input
                  id={`track-${field}`}
                  className="field-control"
                  {...register(field as "minimumAction" | "normalAction" | "strongAction")}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="track-goal">
                End-of-year goal
              </label>
              <textarea
                id="track-goal"
                rows={3}
                className="field-control"
                {...register("endOfYearGoal")}
              />
            </div>
            <label className="flex min-h-11 items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                className="size-5 accent-brand"
                {...register("countsTowardNoZero")}
              />
              <span>
                <span className="block font-semibold">Counts toward No Zero</span>
                <span className="block text-sm text-muted">
                  A completed activity in this project makes the day active.
                </span>
              </span>
            </label>
            <div className="flex justify-end gap-3 sm:col-span-2">
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save project"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
