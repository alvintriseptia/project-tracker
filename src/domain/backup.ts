import type {
  Activity,
  AppSettings,
  Artifact,
  BackupEnvelope,
  MonthlyMission,
  Track,
  VinanceFeature,
  VinanceTask,
} from "./types";
import {
  activitySchema,
  appSettingsSchema,
  artifactSchema,
  monthlyMissionSchema,
  trackSchema,
  vinanceFeatureSchema,
  vinanceTaskSchema,
} from "./schemas";

export type BackupData = BackupEnvelope["data"];

export type BackupSelection = BackupEnvelope["selection"];

export function createBackupEnvelope(input: {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  selection?: BackupSelection;
  data: {
    tracks: Track[];
    activities: Activity[];
    artifacts: Artifact[];
    missions: MonthlyMission[];
    vinanceFeatures: VinanceFeature[];
    vinanceTasks: VinanceTask[];
    settings: AppSettings;
  };
}): BackupEnvelope {
  return {
    format: "no-zero-backup",
    schemaVersion: input.schemaVersion,
    appVersion: input.appVersion,
    exportedAt: input.exportedAt,
    selection: input.selection ?? { mode: "full" },
    data: input.data,
  };
}

export function parseBackupEnvelope(input: unknown): BackupEnvelope {
  if (!input || typeof input !== "object") {
    throw new Error("Backup file is not a JSON object.");
  }
  const candidate = input as Partial<BackupEnvelope>;
  if (candidate.format !== "no-zero-backup") {
    throw new Error("Backup file is not a No Zero backup.");
  }
  if (candidate.schemaVersion !== 1) {
    throw new Error(`Unsupported backup schema version: ${String(candidate.schemaVersion)}.`);
  }
  if (!candidate.data) {
    throw new Error("Backup file is missing data.");
  }

  return {
    format: "no-zero-backup",
    schemaVersion: 1,
    appVersion: String(candidate.appVersion ?? "unknown"),
    exportedAt: String(candidate.exportedAt),
    selection: parseSelection(candidate.selection),
    data: {
      tracks: candidate.data.tracks.map((record) => trackSchema.parse(record) as Track),
      activities: candidate.data.activities.map((record) => activitySchema.parse(record) as Activity),
      artifacts: candidate.data.artifacts.map((record) => artifactSchema.parse(record) as Artifact),
      missions: candidate.data.missions.map((record) => monthlyMissionSchema.parse(record) as MonthlyMission),
      vinanceFeatures: candidate.data.vinanceFeatures.map(
        (record) => vinanceFeatureSchema.parse(record) as VinanceFeature,
      ),
      vinanceTasks: candidate.data.vinanceTasks.map(
        (record) => vinanceTaskSchema.parse(record) as VinanceTask,
      ),
      settings: appSettingsSchema.parse(candidate.data.settings) as AppSettings,
    },
  };
}

function parseSelection(selection: BackupEnvelope["selection"] | undefined): BackupSelection {
  if (!selection || selection.mode === "full") return { mode: "full" };
  if (selection.mode === "date_range") {
    return {
      mode: "date_range",
      ...(selection.from ? { from: selection.from } : {}),
      ...(selection.to ? { to: selection.to } : {}),
    };
  }
  if (selection.mode === "track") {
    return {
      mode: "track",
      ...(selection.trackId ? { trackId: selection.trackId } : {}),
    };
  }
  return { mode: "full" };
}
