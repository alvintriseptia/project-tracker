import Dexie, { type EntityTable } from "dexie";

import type {
  Activity,
  AppSettings,
  Artifact,
  DatabaseMetadata,
  MonthlyMission,
  Track,
  VinanceFeature,
  VinanceTask,
} from "../domain/types";

export const DATABASE_NAME = "no-zero";
export const SCHEMA_VERSION = 1;
export const SEED_VERSION = 1;

export class NoZeroDatabase extends Dexie {
  tracks!: EntityTable<Track, "id">;
  activities!: EntityTable<Activity, "id">;
  artifacts!: EntityTable<Artifact, "id">;
  missions!: EntityTable<MonthlyMission, "id">;
  vinanceFeatures!: EntityTable<VinanceFeature, "id">;
  vinanceTasks!: EntityTable<VinanceTask, "id">;
  settings!: EntityTable<AppSettings, "id">;
  metadata!: EntityTable<DatabaseMetadata, "id">;

  constructor(name = DATABASE_NAME) {
    super(name);
    this.version(SCHEMA_VERSION).stores({
      tracks: "id, &slug, status, sortOrder, updatedAt",
      activities:
        "id, date, trackId, [trackId+date], updatedAt, *tags",
      artifacts:
        "id, type, date, trackId, status, [type+date], updatedAt, *tags",
      missions: "id, &month, updatedAt",
      vinanceFeatures: "id, status, priority, module, updatedAt",
      vinanceTasks: "id, featureId, [featureId+status], updatedAt",
      settings: "id",
      metadata: "id",
    });
  }
}

export const db = new NoZeroDatabase();
