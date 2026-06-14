import type {
  Activity,
  AppSettings,
  BackupEnvelope,
  DatabaseMetadata,
  DateRange,
  EntityId,
  Track,
} from "../domain/types";
import type { NoZeroDatabase } from "./database";

export class ActivityRepository {
  constructor(private readonly database: NoZeroDatabase) {}

  get(id: EntityId): Promise<Activity | undefined> {
    return this.database.activities.get(id);
  }

  listByDateRange(range: DateRange): Promise<Activity[]> {
    return this.database.activities
      .where("date")
      .between(range.from, range.to, true, true)
      .sortBy("date");
  }

  listByTrack(trackId: EntityId, range?: DateRange): Promise<Activity[]> {
    if (range) {
      return this.database.activities
        .where("[trackId+date]")
        .between([trackId, range.from], [trackId, range.to], true, true)
        .sortBy("date");
    }
    return this.database.activities.where("trackId").equals(trackId).sortBy("date");
  }

  put(activity: Activity): Promise<string> {
    return this.database.activities.put(activity);
  }

  delete(id: EntityId): Promise<void> {
    return this.database.activities.delete(id);
  }
}

export class TrackRepository {
  constructor(private readonly database: NoZeroDatabase) {}

  list(): Promise<Track[]> {
    return this.database.tracks.orderBy("sortOrder").toArray();
  }

  listActive(): Promise<Track[]> {
    return this.database.tracks
      .where("status")
      .equals("active")
      .sortBy("sortOrder");
  }

  get(id: EntityId): Promise<Track | undefined> {
    return this.database.tracks.get(id);
  }

  put(track: Track): Promise<string> {
    return this.database.tracks.put(track);
  }
}

export class SettingsRepository {
  constructor(private readonly database: NoZeroDatabase) {}

  async get(): Promise<AppSettings> {
    const settings = await this.database.settings.get("app");
    if (!settings) {
      throw new Error("Application settings are missing.");
    }
    return settings;
  }

  put(settings: AppSettings): Promise<"app"> {
    return this.database.settings.put(settings);
  }
}

export class MetadataRepository {
  constructor(private readonly database: NoZeroDatabase) {}

  async get(): Promise<DatabaseMetadata> {
    const metadata = await this.database.metadata.get("database");
    if (!metadata) {
      throw new Error("Database metadata is missing.");
    }
    return metadata;
  }

  put(metadata: DatabaseMetadata): Promise<"database"> {
    return this.database.metadata.put(metadata);
  }
}

export type DatabaseSnapshot = BackupEnvelope["data"];

export async function readFullSnapshot(
  database: NoZeroDatabase,
): Promise<DatabaseSnapshot> {
  return database.transaction(
    "r",
    [
      database.tracks,
      database.activities,
      database.artifacts,
      database.missions,
      database.vinanceFeatures,
      database.vinanceTasks,
      database.settings,
    ],
    async () => {
      const [
        tracks,
        activities,
        artifacts,
        missions,
        vinanceFeatures,
        vinanceTasks,
        settings,
      ] = await Promise.all([
        database.tracks.toArray(),
        database.activities.toArray(),
        database.artifacts.toArray(),
        database.missions.toArray(),
        database.vinanceFeatures.toArray(),
        database.vinanceTasks.toArray(),
        database.settings.get("app"),
      ]);
      if (!settings) {
        throw new Error("Application settings are missing.");
      }
      return {
        tracks,
        activities,
        artifacts,
        missions,
        vinanceFeatures,
        vinanceTasks,
        settings,
      };
    },
  );
}
