import * as Dialog from "@radix-ui/react-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

import { Button } from "../../components/Button";
import { useToast } from "../../components/ToastProvider";
import { artifactSchema } from "../../domain/schemas";
import type { Artifact, MonthlyMission, MonthlyReviewDetails } from "../../domain/types";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { ArtifactRepository, TrackRepository } from "../../db/repositories";
import { findMonthlyReview } from "../../db/relationships";

const artifactRepository = new ArtifactRepository(db);
const trackRepository = new TrackRepository(db);

const fields: [keyof MonthlyReviewDetails, string][] = [
  ["majorProgress", "Major progress"],
  ["unfinishedWork", "Unfinished work"],
  ["mainLesson", "Main lesson"],
  ["nextMonthFocus", "Next month focus"],
];

export function MonthlyReviewDialog({
  mission,
  open,
  onOpenChange,
}: {
  mission: MonthlyMission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const existing = useLiveQuery(() => findMonthlyReview(db, mission.month), [mission.month]);
  const options = useLiveQuery(async () => {
    const [tracks, artifacts] = await Promise.all([
      trackRepository.list(),
      artifactRepository.list(),
    ]);
    return {
      tracks,
      artifacts: artifacts.filter(
        (artifact) =>
          artifact.status !== "archived" &&
          artifact.type !== "monthly_review",
      ),
    };
  }, []);
  const [draft, setDraft] = useState<MonthlyReviewDetails>();
  const [saving, setSaving] = useState(false);
  const { announce } = useToast();
  const details = draft ?? (existing?.details.kind === "monthly_review" ? existing.details : {
    kind: "monthly_review",
    month: mission.month,
    majorProgress: "",
    unfinishedWork: "",
    mainLesson: "",
    nextMonthFocus: "",
  });
  function setOptionalSelection(
    field: "strongestTrackId" | "weakestTrackId" | "bestArtifactId",
    value: string,
  ) {
    const next = { ...details };
    if (value) next[field] = value;
    else delete next[field];
    setDraft(next);
  }

  async function save() {
    setSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const artifact = artifactSchema.parse({
        id: existing?.id ?? crypto.randomUUID(),
        type: "monthly_review",
        title: `Monthly Review: ${mission.month}`,
        date: `${mission.month}-01`,
        tags: ["monthly-review"],
        status: "completed",
        content: details.majorProgress,
        details,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      }) as Artifact;
      await db.transaction("rw", db.artifacts, db.missions, async () => {
        await db.artifacts.put(artifact);
        await db.missions.put({
          ...mission,
          reviewArtifactId: artifact.id,
          updatedAt: timestamp,
        });
      });
      announce("Monthly review saved.");
      onOpenChange(false);
    } catch (error) {
      announce(storageErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-2xl font-semibold">Monthly review · {mission.month}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted">Capture the month’s outcome and direction.</Dialog.Description>
          <div className="mt-5 grid gap-4">
            {fields.map(([field, label]) => (
              <label key={field}>
                <span className="field-label">{label}</span>
                <textarea className="field-control" rows={3} value={String(details[field] ?? "")} onChange={(event) => setDraft({ ...details, [field]: event.target.value })} />
              </label>
            ))}
            <label>
              <span className="field-label">Strongest project</span>
              <select className="field-control" value={details.strongestTrackId ?? ""} onChange={(event) => setOptionalSelection("strongestTrackId", event.target.value)}>
                <option value="">Not selected</option>
                {options?.tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Weakest project</span>
              <select className="field-control" value={details.weakestTrackId ?? ""} onChange={(event) => setOptionalSelection("weakestTrackId", event.target.value)}>
                <option value="">Not selected</option>
                {options?.tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Best artifact</span>
              <select className="field-control" value={details.bestArtifactId ?? ""} onChange={(event) => setOptionalSelection("bestArtifactId", event.target.value)}>
                <option value="">Not selected</option>
                {options?.artifacts.map((artifact) => <option key={artifact.id} value={artifact.id}>{artifact.title}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
              <Button disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save review"}</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
