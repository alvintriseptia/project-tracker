import { Archive, ArrowLeft, Pencil, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../components/ToastProvider";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { TrackRepository } from "../../db/repositories";
import { useActivityComposer } from "../activities/ActivityComposerProvider";
import { TrackArchiveDialog } from "./TrackArchiveDialog";
import { TrackEditDialog } from "./TrackEditDialog";
import { setTrackStatus } from "./trackService";
import { useProjectData } from "./useProjectsData";

const repository = new TrackRepository(db);

export function ProjectDetailPage() {
  const { trackId = "" } = useParams();
  const data = useProjectData(trackId);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const { openCreate, openEdit } = useActivityComposer();
  const { announce } = useToast();

  if (!data) return <p className="text-muted">Loading project...</p>;
  if (data.missing) {
    return (
      <EmptyState
        title="Project not found"
        description="The project may have been removed from this local dataset."
        action={
          <Button asChild>
            <Link to="/projects">Back to projects</Link>
          </Button>
        }
      />
    );
  }

  const { track } = data;

  async function restore() {
    try {
      await setTrackStatus({ repository, track, status: "active" });
      announce(`${track.name} restored.`);
    } catch (error) {
      announce(storageErrorMessage(error));
    }
  }

  return (
    <div className="grid gap-8">
      <div>
        <Link
          to="/projects"
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand"
        >
          <ArrowLeft size={18} />
          All projects
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className="grid size-14 place-items-center rounded-2xl text-2xl font-bold text-white"
              style={{ backgroundColor: track.color }}
              aria-hidden="true"
            >
              {track.name.slice(0, 1)}
            </span>
            <div>
              <h1 className="font-display text-4xl font-semibold sm:text-5xl">
                {track.name}
              </h1>
              <p className="mt-2 text-muted">{track.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={17} />
              Edit
            </Button>
            {track.status === "active" ? (
              <Button variant="secondary" onClick={() => setArchiving(true)}>
                <Archive size={17} />
                Archive
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => void restore()}>
                <RotateCcw size={17} />
                Restore
              </Button>
            )}
            {track.status === "active" ? (
              <Button
                onClick={() =>
                  openCreate({
                    trackId: track.id,
                    title: track.minimumAction,
                  })
                }
              >
                Log activity
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-muted">Total sessions</p>
          <p className="mt-2 font-display text-4xl font-semibold">
            {data.totals.sessions}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-muted">Total points</p>
          <p className="mt-2 font-display text-4xl font-semibold">
            {data.totals.points}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-muted">This week</p>
          <p className="mt-2 font-display text-4xl font-semibold">
            {data.progress?.completed ?? 0}
            <span className="text-xl text-muted">/{track.weeklyTarget}</span>
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="section-kicker">Action ladder</p>
          <dl className="mt-4 grid gap-4">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                Minimum
              </dt>
              <dd className="mt-1 font-semibold">{track.minimumAction}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                Normal
              </dt>
              <dd className="mt-1 font-semibold">{track.normalAction}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                Strong
              </dt>
              <dd className="mt-1 font-semibold">{track.strongAction}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <p className="section-kicker">End-of-year direction</p>
          <p className="mt-4 text-lg leading-relaxed">
            {track.endOfYearGoal ?? "No end-of-year goal has been set."}
          </p>
          <p className="mt-5 text-sm text-muted">
            Future activities default to {track.defaultPoints} points. Weekly
            target: {track.weeklyTarget} sessions.
          </p>
        </Card>
      </div>

      <section>
        <p className="section-kicker">History</p>
        <h2 className="section-title">Completed activities</h2>
        {data.activities.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No activity history"
              description={`Log the first completed action for ${track.name}.`}
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-3">
            {data.activities.map((activity) => (
              <button
                key={activity.id}
                className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 text-left hover:border-brand"
                onClick={() => openEdit(activity)}
              >
                <span>
                  <span className="block font-semibold">{activity.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {activity.date} · {activity.level}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-brand">
                  {activity.points + activity.bonusPoints} pts
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <TrackEditDialog
        track={track}
        open={editing}
        onOpenChange={setEditing}
      />
      <TrackArchiveDialog
        track={track}
        open={archiving}
        onOpenChange={setArchiving}
      />
    </div>
  );
}
