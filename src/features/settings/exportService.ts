import packageJson from "../../../package.json";
import {
  createBackupEnvelope,
  parseBackupEnvelope,
  type BackupData,
  type BackupSelection,
} from "../../domain/backup";
import type { BackupEnvelope, EntityId } from "../../domain/types";
import type { NoZeroDatabase } from "../../db/database";
import {
  MetadataRepository,
  readFullSnapshot,
} from "../../db/repositories";

type DataTable =
  | "tracks"
  | "activities"
  | "artifacts"
  | "missions"
  | "vinanceFeatures"
  | "vinanceTasks";
type ImportMode = "merge" | "replace";

export type ImportPreview = {
  envelope: BackupEnvelope;
  counts: Record<DataTable, {
    create: number;
    update: number;
    unchanged: number;
    conflict: number;
  }>;
  hasConflicts: boolean;
};

export async function prepareFullBackup(
  database: NoZeroDatabase,
  now = new Date(),
): Promise<{
  envelope: BackupEnvelope;
  json: string;
  filename: string;
}> {
  const metadata = await new MetadataRepository(database).get();
  const data = await readFullSnapshot(database);
  const envelope = createBackupEnvelope({
    schemaVersion: metadata.schemaVersion,
    appVersion: packageJson.version,
    exportedAt: now.toISOString(),
    data,
  });
  return {
    envelope,
    json: JSON.stringify(envelope, null, 2),
    filename: `no-zero-backup-${now.toISOString().slice(0, 10)}.json`,
  };
}

export async function prepareSelectedBackup(
  database: NoZeroDatabase,
  selection: BackupSelection,
  now = new Date(),
): Promise<{
  envelope: BackupEnvelope;
  json: string;
  filename: string;
}> {
  const metadata = await new MetadataRepository(database).get();
  const full = await readFullSnapshot(database);
  const data = selectBackupData(full, selection);
  const envelope = createBackupEnvelope({
    schemaVersion: metadata.schemaVersion,
    appVersion: packageJson.version,
    exportedAt: now.toISOString(),
    selection,
    data,
  });
  const label = selection.mode === "full" ? "full" : selection.mode.replace("_", "-");
  return {
    envelope,
    json: JSON.stringify(envelope, null, 2),
    filename: `no-zero-backup-${label}-${now.toISOString().slice(0, 10)}.json`,
  };
}

export async function downloadFullBackup(
  database: NoZeroDatabase,
  now = new Date(),
): Promise<string> {
  const prepared = await prepareFullBackup(database, now);
  const url = URL.createObjectURL(
    new Blob([prepared.json], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = prepared.filename;
  anchor.click();
  URL.revokeObjectURL(url);

  const metadataRepository = new MetadataRepository(database);
  const metadata = await metadataRepository.get();
  await metadataRepository.put({
    ...metadata,
    lastBackupAt: now.toISOString(),
  });
  return prepared.filename;
}

export async function downloadSelectedBackup(
  database: NoZeroDatabase,
  selection: BackupSelection,
  now = new Date(),
): Promise<string> {
  const prepared = await prepareSelectedBackup(database, selection, now);
  downloadText(prepared.json, prepared.filename, "application/json");
  await markBackupDownloaded(database, now);
  return prepared.filename;
}

export async function prepareMarkdownExport(
  database: NoZeroDatabase,
  selection: BackupSelection = { mode: "full" },
  now = new Date(),
): Promise<{ markdown: string; filename: string }> {
  const full = await readFullSnapshot(database);
  const data = selectBackupData(full, selection);
  const lines = [
    "# No Zero Export",
    "",
    `Exported: ${now.toISOString()}`,
    `Selection: ${describeSelection(selection)}`,
    "",
    "## Summary",
    "",
    `- Tracks: ${data.tracks.length}`,
    `- Activities: ${data.activities.length}`,
    `- Artifacts: ${data.artifacts.length}`,
    `- Missions: ${data.missions.length}`,
    `- Vinance features: ${data.vinanceFeatures.length}`,
    `- Vinance tasks: ${data.vinanceTasks.length}`,
    "",
    "## Activities",
    "",
    ...data.activities.map((activity) => {
      const track = data.tracks.find((item) => item.id === activity.trackId);
      return `- ${activity.date} - ${track?.name ?? activity.trackId}: ${activity.title} (${activity.points + activity.bonusPoints} pts)`;
    }),
    "",
    "## Artifacts",
    "",
    ...data.artifacts.map((artifact) => `- ${artifact.date} - ${artifact.title} [${artifact.type}]`),
  ];
  return {
    markdown: `${lines.join("\n")}\n`,
    filename: `no-zero-report-${now.toISOString().slice(0, 10)}.md`,
  };
}

export async function downloadMarkdownExport(
  database: NoZeroDatabase,
  selection: BackupSelection = { mode: "full" },
  now = new Date(),
): Promise<string> {
  const prepared = await prepareMarkdownExport(database, selection, now);
  downloadText(prepared.markdown, prepared.filename, "text/markdown");
  return prepared.filename;
}

export async function previewImport(
  database: NoZeroDatabase,
  text: string,
): Promise<ImportPreview> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Import file is not valid JSON.");
  }
  const envelope = parseBackupEnvelope(parsed);
  const local = await readFullSnapshot(database);
  const counts: ImportPreview["counts"] = {
    tracks: compareTable(local.tracks, envelope.data.tracks),
    activities: compareTable(local.activities, envelope.data.activities),
    artifacts: compareTable(local.artifacts, envelope.data.artifacts),
    missions: compareTable(local.missions, envelope.data.missions),
    vinanceFeatures: compareTable(local.vinanceFeatures, envelope.data.vinanceFeatures),
    vinanceTasks: compareTable(local.vinanceTasks, envelope.data.vinanceTasks),
  };
  return {
    envelope,
    counts,
    hasConflicts: Object.values(counts).some((count) => count.conflict > 0),
  };
}

export async function applyImport(
  database: NoZeroDatabase,
  preview: ImportPreview,
  mode: ImportMode,
): Promise<void> {
  if (preview.hasConflicts) {
    throw new Error("Resolve import conflicts before applying this backup.");
  }

  const incoming = preview.envelope.data;
  const local = mode === "merge" ? await readFullSnapshot(database) : undefined;
  await database.transaction(
    "rw",
    [
      database.tracks,
      database.activities,
      database.artifacts,
      database.missions,
      database.vinanceFeatures,
      database.vinanceTasks,
      database.settings,
      database.metadata,
    ],
    async () => {
      if (mode === "replace") {
        await Promise.all([
          database.tracks.clear(),
          database.activities.clear(),
          database.artifacts.clear(),
          database.missions.clear(),
          database.vinanceFeatures.clear(),
          database.vinanceTasks.clear(),
        ]);
        await Promise.all([
          database.tracks.bulkPut(incoming.tracks),
          database.activities.bulkPut(incoming.activities),
          database.artifacts.bulkPut(incoming.artifacts),
          database.missions.bulkPut(incoming.missions),
          database.vinanceFeatures.bulkPut(incoming.vinanceFeatures),
          database.vinanceTasks.bulkPut(incoming.vinanceTasks),
        ]);
      } else {
        if (!local) throw new Error("Local data is unavailable for merge.");
        await Promise.all([
          database.tracks.bulkPut(mergeRecords(local.tracks, incoming.tracks)),
          database.activities.bulkPut(mergeRecords(local.activities, incoming.activities)),
          database.artifacts.bulkPut(mergeRecords(local.artifacts, incoming.artifacts)),
          database.missions.bulkPut(mergeRecords(local.missions, incoming.missions)),
          database.vinanceFeatures.bulkPut(mergeRecords(local.vinanceFeatures, incoming.vinanceFeatures)),
          database.vinanceTasks.bulkPut(mergeRecords(local.vinanceTasks, incoming.vinanceTasks)),
        ]);
      }
      await database.settings.put(incoming.settings);
      const metadata = await new MetadataRepository(database).get();
      await database.metadata.put({
        ...metadata,
        schemaVersion: preview.envelope.schemaVersion,
      });
    },
  );
}

export async function resetApplicationData(database: NoZeroDatabase): Promise<void> {
  await database.transaction(
    "rw",
    [
      database.tracks,
      database.activities,
      database.artifacts,
      database.missions,
      database.vinanceFeatures,
      database.vinanceTasks,
      database.settings,
      database.metadata,
    ],
    async () => {
      await Promise.all([
        database.tracks.clear(),
        database.activities.clear(),
        database.artifacts.clear(),
        database.missions.clear(),
        database.vinanceFeatures.clear(),
        database.vinanceTasks.clear(),
        database.settings.clear(),
        database.metadata.clear(),
      ]);
    },
  );
}

export async function estimateStorage(): Promise<{ usage?: number; quota?: number }> {
  if (!navigator.storage?.estimate) return {};
  const estimate = await navigator.storage.estimate();
  return {
    ...(typeof estimate.usage === "number" ? { usage: estimate.usage } : {}),
    ...(typeof estimate.quota === "number" ? { quota: estimate.quota } : {}),
  };
}

function selectBackupData(data: BackupData, selection: BackupSelection): BackupData {
  if (selection.mode === "full") return data;
  if (selection.mode === "date_range") {
    const from = selection.from ?? "0000-01-01";
    const to = selection.to ?? "9999-12-31";
    const activities = data.activities.filter((activity) => activity.date >= from && activity.date <= to);
    const artifacts = data.artifacts.filter((artifact) => artifact.date >= from && artifact.date <= to);
    const trackIds = new Set<EntityId>([
      ...activities.map((activity) => activity.trackId),
      ...artifacts.flatMap((artifact) => artifact.trackId ? [artifact.trackId] : []),
    ]);
    return {
      ...data,
      tracks: data.tracks.filter((track) => trackIds.has(track.id)),
      activities,
      artifacts,
      missions: data.missions.filter((mission) => mission.month >= from.slice(0, 7) && mission.month <= to.slice(0, 7)),
    };
  }
  const trackId = selection.trackId;
  if (!trackId) return data;
  const activities = data.activities.filter((activity) => activity.trackId === trackId);
  const artifactIds = new Set(activities.flatMap((activity) => activity.artifactIds));
  const artifacts = data.artifacts.filter(
    (artifact) => artifact.trackId === trackId || artifactIds.has(artifact.id),
  );
  return {
    ...data,
    tracks: data.tracks.filter((track) => track.id === trackId),
    activities,
    artifacts,
    missions: data.missions.filter((mission) =>
      mission.targetArtifactIds.some((id) => artifactIds.has(id)) ||
      (mission.reviewArtifactId ? artifactIds.has(mission.reviewArtifactId) : false),
    ),
  };
}

function compareTable<T extends { id: EntityId; updatedAt: string }>(
  local: T[],
  incoming: T[],
): ImportPreview["counts"][DataTable] {
  const localById = new Map(local.map((record) => [record.id, record]));
  return incoming.reduce(
    (counts, record) => {
      const existing = localById.get(record.id);
      if (!existing) counts.create += 1;
      else if (sameRecord(existing, record)) counts.unchanged += 1;
      else if (existing.updatedAt === record.updatedAt) counts.conflict += 1;
      else counts.update += 1;
      return counts;
    },
    { create: 0, update: 0, unchanged: 0, conflict: 0 },
  );
}

function mergeRecords<T extends { id: EntityId; updatedAt: string }>(local: T[], incoming: T[]): T[] {
  const merged = new Map(local.map((record) => [record.id, record]));
  for (const record of incoming) {
    const existing = merged.get(record.id);
    if (!existing || record.updatedAt > existing.updatedAt) {
      merged.set(record.id, record);
    }
  }
  return [...merged.values()];
}

function sameRecord(left: unknown, right: unknown): boolean {
  return JSON.stringify(sortValue(left)) === JSON.stringify(sortValue(right));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortValue(item)]),
    );
  }
  return value;
}

function downloadText(text: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function markBackupDownloaded(database: NoZeroDatabase, now: Date): Promise<void> {
  const metadataRepository = new MetadataRepository(database);
  const metadata = await metadataRepository.get();
  await metadataRepository.put({
    ...metadata,
    lastBackupAt: now.toISOString(),
  });
}

function describeSelection(selection: BackupSelection): string {
  if (selection.mode === "date_range") return `date range ${selection.from ?? "start"} to ${selection.to ?? "end"}`;
  if (selection.mode === "track") return `track ${selection.trackId ?? "all"}`;
  return "full";
}
