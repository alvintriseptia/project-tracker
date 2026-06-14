import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useToast } from "../../components/ToastProvider";
import { shiftLocalDate, todayInTimeZone } from "../../domain/dates";
import { canCompleteWeeklyReview, weeklyReviewSummary } from "../../domain/reviews";
import { weekRange } from "../../domain/selectors";
import { artifactSchema } from "../../domain/schemas";
import type { Artifact, WeeklyReviewDetails } from "../../domain/types";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { findWeeklyReview } from "../../db/relationships";
import { ActivityRepository, ArtifactRepository, SettingsRepository, TrackRepository } from "../../db/repositories";

const activitiesRepository = new ActivityRepository(db);
const artifactsRepository = new ArtifactRepository(db);
const settingsRepository = new SettingsRepository(db);
const tracksRepository = new TrackRepository(db);

const emptyDetails = (from: string, to: string): WeeklyReviewDetails => ({
  kind: "weekly_review",
  weekStart: from,
  weekEnd: to,
  wentWell: "",
  skippedOrAvoided: "",
  consistencyHelp: "",
  consistencyBlocker: "",
  nextWeekPriority: "",
});

export function WeeklyReviewPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [draft, setDraft] = useState<WeeklyReviewDetails>();
  const [saving, setSaving] = useState(false);
  const { announce } = useToast();
  const data = useLiveQuery(async () => {
    const [settings, tracks, artifacts] = await Promise.all([
      settingsRepository.get(),
      tracksRepository.list(),
      artifactsRepository.list(),
    ]);
    const today = todayInTimeZone(settings.timeZone);
    const selectedDate = shiftLocalDate(today, weekOffset * 7);
    const range = weekRange(selectedDate, settings);
    const activities = await activitiesRepository.listByDateRange(range);
    const existing = await findWeeklyReview(db, range.from);
    return {
      settings,
      tracks,
      artifacts,
      today,
      range,
      existing,
      summary: weeklyReviewSummary({ range, activities, artifacts, tracks, settings }),
    };
  }, [weekOffset]);
  if (!data) return <p className="text-muted">Loading weekly review…</p>;
  const currentData = data;
  const details =
    draft ??
    (data.existing?.details.kind === "weekly_review"
      ? data.existing.details
      : emptyDetails(data.range.from, data.range.to));
  const canComplete = canCompleteWeeklyReview(data.range.to, data.today);

  function update(field: keyof WeeklyReviewDetails, value: string) {
    setDraft({ ...details, [field]: value });
  }

  async function save(completed: boolean) {
    if (completed && !canComplete) return;
    setSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const artifact = artifactSchema.parse({
        id: currentData.existing?.id ?? crypto.randomUUID(),
        type: "weekly_review",
        title: `Weekly Review: ${currentData.range.from} to ${currentData.range.to}`,
        date: currentData.range.to,
        tags: ["weekly-review"],
        status: completed ? "completed" : "drafting",
        content: details.wentWell,
        details,
        createdAt: currentData.existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      }) as Artifact;
      await db.artifacts.put(artifact);
      setDraft(undefined);
      announce(completed ? "Weekly review completed." : "Weekly review draft saved.");
    } catch (error) {
      announce(storageErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Weekly review</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Close the week intentionally</h1>
          <p className="mt-2 text-muted">{data.range.from} through {data.range.to}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" aria-label="Previous week" onClick={() => { setWeekOffset((value) => value - 1); setDraft(undefined); }}><ChevronLeft /></Button>
          <Button variant="secondary" aria-label="Next week" disabled={weekOffset >= 0} onClick={() => { setWeekOffset((value) => value + 1); setDraft(undefined); }}><ChevronRight /></Button>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><p className="text-sm text-muted">Points</p><p className="mt-2 font-display text-4xl font-semibold">{data.summary.points}</p></Card>
        <Card><p className="text-sm text-muted">Active days</p><p className="mt-2 font-display text-4xl font-semibold">{data.summary.activeDays}</p></Card>
        <Card><p className="text-sm text-muted">Artifacts</p><p className="mt-2 font-display text-4xl font-semibold">{data.summary.artifacts.length}</p></Card>
        <Card><p className="text-sm text-muted">Status</p><p className="mt-2 text-lg font-semibold capitalize">{data.summary.status.replaceAll("_", " ")}</p></Card>
      </div>
      <Card>
        <h2 className="font-display text-2xl font-semibold">Project sessions</h2>
        <div className="mt-4 grid gap-3">
          {data.summary.progress.map((item) => (
            <div key={item.track.id} className="flex justify-between gap-4 border-b border-line pb-2 text-sm">
              <span className="font-semibold">{item.track.name}</span>
              <span className="text-muted">{item.completed}/{item.target} · {item.remaining} remaining</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="font-display text-2xl font-semibold">Written reflection</h2>
        <div className="mt-5 grid gap-4">
          {[
            ["wentWell", "What went well?"],
            ["skippedOrAvoided", "What did you skip or avoid?"],
            ["consistencyHelp", "What helped consistency?"],
            ["consistencyBlocker", "What blocked consistency?"],
            ["nextWeekPriority", "What is next week’s priority?"],
          ].map(([field, label]) => (
            <label key={field}>
              <span className="field-label">{label}</span>
              <textarea className="field-control" rows={3} value={String(details[field as keyof WeeklyReviewDetails] ?? "")} onChange={(event) => update(field as keyof WeeklyReviewDetails, event.target.value)} />
            </label>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Best artifact</span>
              <select className="field-control" value={details.bestArtifactId ?? ""} onChange={(event) => update("bestArtifactId", event.target.value)}>
                <option value="">None selected</option>
                {data.summary.artifacts.map((artifact) => <option key={artifact.id} value={artifact.id}>{artifact.title}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Weakest project</span>
              <select className="field-control" value={details.weakestTrackId ?? data.summary.weakestTrack?.id ?? ""} onChange={(event) => update("weakestTrackId", event.target.value)}>
                <option value="">None selected</option>
                {data.tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" disabled={saving} onClick={() => void save(false)}>Save draft</Button>
            <Button disabled={saving || !canComplete} onClick={() => void save(true)}>Complete review</Button>
          </div>
          {!canComplete ? <p className="text-right text-sm text-muted">Completion becomes available after {data.range.to}. Current-week drafts are available now.</p> : null}
        </div>
      </Card>
    </div>
  );
}
