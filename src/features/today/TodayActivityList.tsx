import { Clock3, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import type { Activity, Track } from "../../domain/types";
import { useActivityComposer } from "../activities/ActivityComposerProvider";
import { DeleteActivityDialog } from "../activities/DeleteActivityDialog";

export function TodayActivityList({
  activities,
  tracks,
}: {
  activities: Activity[];
  tracks: Track[];
}) {
  const [deleting, setDeleting] = useState<Activity>();
  const { openCreate, openEdit } = useActivityComposer();
  const tracksById = new Map(tracks.map((track) => [track.id, track]));

  return (
    <section aria-labelledby="today-activities-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="section-kicker">Evidence</p>
          <h2 id="today-activities-heading" className="section-title">
            Today’s completed actions
          </h2>
        </div>
        <Button variant="secondary" size="sm" onClick={() => openCreate()}>
          Add another
        </Button>
      </div>
      {activities.length === 0 ? (
        <EmptyState
          title="No completed actions yet"
          description="Log the smallest meaningful action you have already completed."
          action={<Button onClick={() => openCreate()}>Log an action</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {activities.map((activity) => {
            const track = tracksById.get(activity.trackId);
            return (
              <article
                key={activity.id}
                className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-4"
              >
                <span
                  className="mt-1 size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: track?.color ?? "#657068" }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{activity.title}</p>
                    <span className="text-xs font-bold uppercase tracking-wide text-muted">
                      {track?.name ?? "Archived project"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <span>
                      {activity.points + activity.bonusPoints} points ·{" "}
                      {activity.level}
                    </span>
                    {activity.durationMinutes ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={14} />
                        {activity.durationMinutes} min
                      </span>
                    ) : null}
                  </div>
                  {activity.note ? (
                    <p className="mt-2 text-sm text-muted">{activity.note}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${activity.title}`}
                    onClick={() => openEdit(activity)}
                  >
                    <Pencil size={17} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${activity.title}`}
                    onClick={() => setDeleting(activity)}
                  >
                    <Trash2 size={17} />
                  </Button>
                  <MoreHorizontal className="hidden" aria-hidden="true" />
                </div>
              </article>
            );
          })}
        </div>
      )}
      {deleting ? (
        <DeleteActivityDialog
          activity={deleting}
          open
          onOpenChange={(open) => {
            if (!open) setDeleting(undefined);
          }}
        />
      ) : null}
    </section>
  );
}
