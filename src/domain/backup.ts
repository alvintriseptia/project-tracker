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

export type BackupData = BackupEnvelope["data"];

export function createBackupEnvelope(input: {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
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
    selection: { mode: "full" },
    data: input.data,
  };
}
