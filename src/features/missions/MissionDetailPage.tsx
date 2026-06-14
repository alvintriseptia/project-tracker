import { useLiveQuery } from "dexie-react-hooks";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useToast } from "../../components/ToastProvider";
import { missionProgress, setChecklistItemCompletion } from "../../domain/missions";
import type { MonthlyMission } from "../../domain/types";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { ArtifactRepository, MissionRepository } from "../../db/repositories";
import { MonthlyReviewDialog } from "./MonthlyReviewDialog";

const repository = new MissionRepository(db);
const artifactRepository = new ArtifactRepository(db);

export function MissionDetailPage() {
  const { month = "" } = useParams();
  const data = useLiveQuery(async () => {
    const [mission, artifacts] = await Promise.all([
      repository.get(month),
      artifactRepository.list(),
    ]);
    return { mission, artifacts };
  }, [month], null);
  const [newItem, setNewItem] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  const { announce } = useToast();
  if (data === null) return <p className="text-muted">Loading mission…</p>;
  const { mission, artifacts } = data;
  if (!mission) return <p>Mission not found.</p>;
  async function updateMission(
    mutate: (current: MonthlyMission) => MonthlyMission,
  ) {
    const operation = writeQueue.current.then(async () => {
      const current = await repository.get(month);
      if (!current) throw new Error("Mission not found.");
      await repository.put({
        ...mutate(current),
        updatedAt: new Date().toISOString(),
      });
    });
    writeQueue.current = operation.catch(() => undefined);
    try {
      await operation;
    } catch (error) {
      announce(storageErrorMessage(error));
    }
  }
  async function addItem() {
    if (!newItem.trim()) return;
    await updateMission((current) => ({
      ...current,
      checklist: [...current.checklist, { id: crypto.randomUUID(), label: newItem.trim(), completed: false }],
    }));
    setNewItem("");
  }
  async function completeMission() {
    const hasIncompleteItems = mission!.checklist.some((item) => !item.completed);
    if (
      !mission!.completed &&
      hasIncompleteItems &&
      !window.confirm("Complete this mission with unfinished checklist items?")
    ) return;
    await updateMission((current) => ({ ...current, completed: !current.completed }));
  }
  function updateChecklist(index: number, label: string) {
    void updateMission((current) => ({
      ...current,
      checklist: current.checklist.map((item, itemIndex) =>
        itemIndex === index ? { ...item, label } : item
      ),
    }));
  }
  function moveChecklistItem(index: number, offset: -1 | 1) {
    void updateMission((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.checklist.length) return current;
      const checklist = [...current.checklist];
      [checklist[index], checklist[target]] = [checklist[target]!, checklist[index]!];
      return { ...current, checklist };
    });
  }
  return (
    <div className="grid gap-7">
      <div>
        <Link to="/missions" className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand"><ArrowLeft size={18} />Missions</Link>
        <p className="section-kicker mt-4">{mission.month}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{mission.title}</h1>
        <p className="mt-2 text-muted">{mission.theme}</p>
      </div>
      <Card>
        <h2 className="font-display text-2xl font-semibold">Mission details</h2>
        <div className="mt-5 grid gap-4">
          <label>
            <span className="field-label">Title</span>
            <input className="field-control" defaultValue={mission.title} onBlur={(event) => {
              const title = event.target.value;
              void updateMission((current) => ({ ...current, title }));
            }} />
          </label>
          <label>
            <span className="field-label">Theme</span>
            <input className="field-control" defaultValue={mission.theme} onBlur={(event) => {
              const theme = event.target.value;
              void updateMission((current) => ({ ...current, theme }));
            }} />
          </label>
          <label>
            <span className="field-label">Description</span>
            <textarea className="field-control" rows={4} defaultValue={mission.description ?? ""} onBlur={(event) => {
              const description = event.target.value;
              void updateMission((current) => ({ ...current, description }));
            }} />
          </label>
        </div>
      </Card>
      <Card>
        <div className="flex justify-between gap-4"><h2 className="font-display text-2xl font-semibold">Checklist</h2><strong>{missionProgress(mission)}%</strong></div>
        <div className="mt-5 grid gap-2">
          {mission.checklist.map((item, index) => (
            <div key={item.id} className="flex min-h-12 items-center gap-2 rounded-xl border border-line px-3">
              <input aria-label={item.label} type="checkbox" className="size-5 accent-brand" checked={item.completed} onChange={(event) => {
                const completed = event.target.checked;
                void updateMission((current) => ({
                  ...current,
                  checklist: current.checklist.map((candidate) =>
                    candidate.id === item.id
                      ? setChecklistItemCompletion(candidate, completed, new Date().toISOString())
                      : candidate
                  ),
                }));
              }} />
              <input
                aria-label={`Checklist item ${index + 1}`}
                className={`min-w-0 flex-1 bg-transparent py-2 font-semibold outline-none ${item.completed ? "text-muted line-through" : ""}`}
                defaultValue={item.label}
                onBlur={(event) => updateChecklist(index, event.target.value)}
              />
              <Button size="sm" variant="ghost" aria-label={`Move ${item.label} up`} disabled={index === 0} onClick={() => moveChecklistItem(index, -1)}><ArrowUp size={17} /></Button>
              <Button size="sm" variant="ghost" aria-label={`Move ${item.label} down`} disabled={index === mission.checklist.length - 1} onClick={() => moveChecklistItem(index, 1)}><ArrowDown size={17} /></Button>
              <Button size="sm" variant="ghost" aria-label={`Remove ${item.label}`} onClick={() => void updateMission((current) => ({ ...current, checklist: current.checklist.filter((candidate) => candidate.id !== item.id) }))}><Trash2 size={17} /></Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input className="field-control" aria-label="New checklist item" value={newItem} onChange={(event) => setNewItem(event.target.value)} />
          <Button onClick={() => void addItem()}><Plus size={18} />Add</Button>
        </div>
      </Card>
      <Card>
        <h2 className="font-display text-2xl font-semibold">Target artifacts</h2>
        <p className="mt-1 text-sm text-muted">Choose the artifacts that define success for this mission.</p>
        <div className="mt-4 grid gap-2">
          {artifacts.filter((artifact) => artifact.status !== "archived").map((artifact) => (
            <label key={artifact.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3">
              <input
                type="checkbox"
                className="size-5 accent-brand"
                checked={mission.targetArtifactIds.includes(artifact.id)}
                onChange={(event) => {
                  const checked = event.target.checked;
                  void updateMission((current) => ({
                    ...current,
                    targetArtifactIds: checked
                      ? [...new Set([...current.targetArtifactIds, artifact.id])]
                      : current.targetArtifactIds.filter((id) => id !== artifact.id),
                  }));
                }}
              />
              <span><span className="block font-semibold">{artifact.title}</span><span className="block text-sm text-muted">{artifact.date}</span></span>
            </label>
          ))}
          {artifacts.length === 0 ? <p className="text-sm text-muted">No artifacts available yet.</p> : null}
        </div>
      </Card>
      <Card>
        <label>
          <span className="field-label">Mission notes</span>
          <textarea className="field-control" rows={6} defaultValue={mission.notes} onBlur={(event) => {
            const notes = event.target.value;
            void updateMission((current) => ({ ...current, notes }));
          }} />
        </label>
        <div className="mt-4 flex flex-wrap justify-between gap-3">
          <Button variant="secondary" onClick={() => setReviewOpen(true)}>{mission.reviewArtifactId ? "Edit monthly review" : "Write monthly review"}</Button>
          <Button onClick={() => void completeMission()}>{mission.completed ? "Reopen mission" : "Complete mission"}</Button>
        </div>
      </Card>
      <MonthlyReviewDialog mission={mission} open={reviewOpen} onOpenChange={setReviewOpen} />
    </div>
  );
}
