import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { output } from "zod";

import { Button } from "../../components/Button";
import type { Activity, LocalDate, Track } from "../../domain/types";
import {
  activityFormSchema,
  type ActivityFormInput,
  type ActivityFormValues,
} from "./activityFormSchema";

function FieldError({ message }: { message: string | undefined }) {
  return message ? <p className="mt-1 text-sm text-danger">{message}</p> : null;
}

export function ActivityForm({
  tracks,
  today,
  initialTrackId,
  initialTitle,
  initialDate,
  activity,
  onSubmit,
  onDirtyChange,
}: {
  tracks: Track[];
  today: LocalDate;
  initialTrackId?: string;
  initialTitle?: string;
  initialDate?: LocalDate;
  activity?: Activity;
  onSubmit: (values: ActivityFormValues) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(Boolean(activity));
  const initialTrack =
    tracks.find((track) => track.id === (activity?.trackId ?? initialTrackId)) ??
    tracks[0];
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
    setValue,
  } = useForm<
    ActivityFormInput,
    unknown,
    output<typeof activityFormSchema>
  >({
    resolver: zodResolver(activityFormSchema),
    mode: "onBlur",
    defaultValues: {
      trackId: activity?.trackId ?? initialTrack?.id ?? "",
      level: activity?.level ?? "minimum",
      title: activity?.title ?? initialTitle ?? "",
      date: activity?.date ?? initialDate ?? today,
      durationMinutes: activity?.durationMinutes,
      note: activity?.note ?? "",
      points: activity?.points ?? initialTrack?.defaultPoints ?? 0,
      bonusPoints: activity?.bonusPoints ?? 0,
      tags: activity?.tags.join(", ") ?? "",
    },
  });
  const selectedTrackId = useWatch({ control, name: "trackId" });
  const trackRegistration = register("trackId");

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <div>
        <label className="field-label" htmlFor="activity-track">
          Project
        </label>
        <select
          id="activity-track"
          className="field-control"
          {...trackRegistration}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            void trackRegistration.onChange(event);
            const track = tracks.find(
              (candidate) => candidate.id === event.target.value,
            );
            if (track && !activity) {
              setValue("points", track.defaultPoints, { shouldDirty: true });
            }
          }}
        >
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.trackId?.message} />
      </div>

      <fieldset>
        <legend className="field-label">Action level</legend>
        <div className="grid grid-cols-3 gap-2">
          {(["minimum", "normal", "strong"] as const).map((level) => (
            <label
              key={level}
              className="has-[:checked]:border-brand has-[:checked]:bg-emerald-50 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-white px-2 text-sm font-semibold capitalize"
            >
              <input
                className="sr-only"
                type="radio"
                value={level}
                {...register("level")}
              />
              {level}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="field-label" htmlFor="activity-title">
          What did you complete?
        </label>
        <input
          id="activity-title"
          className="field-control"
          placeholder={
            tracks.find((track) => track.id === selectedTrackId)?.minimumAction
          }
          autoFocus
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <button
        className="flex min-h-11 items-center gap-2 justify-self-start text-sm font-semibold text-brand"
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <ChevronDown
          size={17}
          className={expanded ? "rotate-180 transition" : "transition"}
        />
        {expanded ? "Hide details" : "Add details"}
      </button>

      {expanded ? (
        <div className="grid gap-4 rounded-xl bg-black/[0.025] p-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="activity-date">
              Date
            </label>
            <input
              id="activity-date"
              type="date"
              className="field-control"
              {...register("date")}
            />
            <FieldError message={errors.date?.message} />
          </div>
          <div>
            <label className="field-label" htmlFor="activity-duration">
              Duration in minutes
            </label>
            <input
              id="activity-duration"
              type="number"
              min="1"
              className="field-control"
              {...register("durationMinutes")}
            />
            <FieldError message={errors.durationMinutes?.message} />
          </div>
          <div>
            <label className="field-label" htmlFor="activity-points">
              Base points
            </label>
            <input
              id="activity-points"
              type="number"
              min="0"
              className="field-control"
              {...register("points")}
            />
            <FieldError message={errors.points?.message} />
          </div>
          <div>
            <label className="field-label" htmlFor="activity-bonus">
              Bonus points
            </label>
            <input
              id="activity-bonus"
              type="number"
              min="0"
              className="field-control"
              {...register("bonusPoints")}
            />
            <FieldError message={errors.bonusPoints?.message} />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="activity-tags">
              Tags
            </label>
            <input
              id="activity-tags"
              className="field-control"
              placeholder="career, speaking"
              {...register("tags")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="activity-note">
              Note
            </label>
            <textarea
              id="activity-note"
              rows={3}
              className="field-control resize-y"
              {...register("note")}
            />
          </div>
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting || tracks.length === 0}>
        {isSubmitting
          ? "Saving..."
          : activity
            ? "Save changes"
            : "Complete action"}
      </Button>
    </form>
  );
}
