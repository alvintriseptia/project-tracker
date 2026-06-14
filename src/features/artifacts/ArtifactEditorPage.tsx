import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import { Card } from "../../components/Card";
import { useToast } from "../../components/ToastProvider";
import { todayInTimeZone } from "../../domain/dates";
import type { Artifact } from "../../domain/types";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { SettingsRepository, TrackRepository } from "../../db/repositories";
import { ArtifactForm } from "./ArtifactForm";
import type { ArtifactFormValues } from "./artifactFormSchema";
import { saveGenericArtifact } from "./artifactService";

const tracksRepository = new TrackRepository(db);
const settingsRepository = new SettingsRepository(db);

export function ArtifactEditorPage() {
  const { artifactId, type } = useParams();
  const navigate = useNavigate();
  const { announce } = useToast();
  const [error, setError] = useState("");
  const [linkedActivityIds, setLinkedActivityIds] = useState<string[]>();
  const data = useLiveQuery(async () => {
    const [tracks, settings, artifact, activities] = await Promise.all([
      tracksRepository.list(),
      settingsRepository.get(),
      artifactId ? db.artifacts.get(artifactId) : undefined,
      db.activities.orderBy("date").reverse().toArray(),
    ]);
    return { tracks, settings, artifact, activities };
  }, [artifactId]);
  if (!data) return <p className="text-muted">Loading artifact editor…</p>;
  if (artifactId && !data.artifact) return <p>Artifact not found.</p>;
  const currentData = data;

  async function submit(values: ArtifactFormValues) {
    setError("");
    try {
      const track = currentData.tracks.find((candidate) => candidate.id === values.trackId);
      const artifact = await saveGenericArtifact({
        database: db,
        values,
        linkedActivityIds: linkedActivityIds ?? currentData.activities
          .filter((activity) => currentData.artifact && activity.artifactIds.includes(currentData.artifact.id))
          .map((activity) => activity.id),
        ...(track ? { track } : {}),
        ...(currentData.artifact ? { existing: currentData.artifact } : {}),
      });
      announce(currentData.artifact ? "Artifact updated." : "Artifact created.");
      await navigate(`/artifacts/${artifact.id}`);
    } catch (caught) {
      setError(storageErrorMessage(caught));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/artifacts" className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand">
        <ArrowLeft size={18} /> Artifacts
      </Link>
      <h1 className="mt-4 font-display text-4xl font-semibold">
        {data.artifact ? "Edit artifact" : "Create artifact"}
      </h1>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-danger">{error}</p> : null}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <ArtifactForm
          tracks={data.tracks.filter((track) => track.status === "active")}
          today={todayInTimeZone(data.settings.timeZone)}
          {...(data.artifact ? { artifact: data.artifact } : {})}
          {...(type && !data.artifact ? { initialType: type as Artifact["type"] } : {})}
          onSubmit={submit}
        />
      </div>
      <Card className="mt-6">
        <h2 className="font-display text-2xl font-semibold">Linked activities</h2>
        <p className="mt-1 text-sm text-muted">Connect this artifact to existing activity records.</p>
        <div className="mt-4 grid gap-2">
          {data.activities.map((activity) => {
            const initialLinked = Boolean(data.artifact?.id && activity.artifactIds.includes(data.artifact.id));
            const checked = linkedActivityIds?.includes(activity.id) ?? initialLinked;
            return (
              <label key={activity.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3">
                <input
                  type="checkbox"
                  className="size-5 accent-brand"
                  checked={checked}
                  onChange={(event) => {
                    const current = linkedActivityIds ?? data.activities.filter(
                      (candidate) => data.artifact?.id && candidate.artifactIds.includes(data.artifact.id),
                    ).map((candidate) => candidate.id);
                    setLinkedActivityIds(event.target.checked
                      ? [...new Set([...current, activity.id])]
                      : current.filter((id) => id !== activity.id));
                  }}
                />
                <span><span className="block font-semibold">{activity.title}</span><span className="block text-sm text-muted">{activity.date}</span></span>
              </label>
            );
          })}
          {data.activities.length === 0 ? <p className="text-sm text-muted">No activities available yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
