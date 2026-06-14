import {
  appSettingsSchema,
  databaseMetadataSchema,
  monthlyMissionSchema,
  trackSchema,
} from "../domain/schemas";
import { todayInTimeZone } from "../domain/dates";
import type {
  AppSettings,
  DatabaseMetadata,
  MonthlyMission,
  Track,
} from "../domain/types";
import { createSeedMissions } from "../seed/missions";
import { createSeedTracks } from "../seed/tracks";
import {
  SCHEMA_VERSION,
  SEED_VERSION,
  type NoZeroDatabase,
} from "./database";
import { StorageUnavailableError } from "./errors";

export type InitializationOptions = {
  now?: Date;
  locale?: string;
  timeZone?: string;
};

export async function initializeDatabase(
  database: NoZeroDatabase,
  options: InitializationOptions = {},
): Promise<void> {
  if (typeof indexedDB === "undefined") {
    throw new StorageUnavailableError();
  }

  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  const timeZone =
    options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const locale =
    options.locale ?? Intl.DateTimeFormat().resolvedOptions().locale ?? "en-US";
  const startDate = todayInTimeZone(timeZone, now);

  await database.transaction(
    "rw",
    database.tracks,
    database.settings,
    database.metadata,
    database.missions,
    async () => {
      const existingTrackIds = new Set(
        (await database.tracks.toCollection().primaryKeys()).map(String),
      );
      const missingTracks = createSeedTracks(timestamp)
        .filter((track) => !existingTrackIds.has(track.id))
        .map((track) => trackSchema.parse(track) as Track);
      if (missingTracks.length > 0) {
        await database.tracks.bulkAdd(missingTracks);
      }

      if (!(await database.settings.get("app"))) {
        const settings = appSettingsSchema.parse({
          id: "app",
          challengeStartDate: startDate,
          challengeEndDate: "2026-12-31",
          weekStartsOn: "monday",
          locale,
          timeZone,
          theme: "system",
          weeklyThresholds: {
            minimumWin: 15,
            goodWeek: 22,
            excellentWeek: 28,
          },
          reminders: { enabled: false },
          updatedAt: timestamp,
        }) as AppSettings;
        await database.settings.add(settings);
      }

      if (!(await database.metadata.get("database"))) {
        const metadata = databaseMetadataSchema.parse({
          id: "database",
          schemaVersion: SCHEMA_VERSION,
          seedVersion: SEED_VERSION,
          initializedAt: timestamp,
        }) as DatabaseMetadata;
        await database.metadata.add(metadata);
      } else {
        await database.metadata.update("database", {
          schemaVersion: SCHEMA_VERSION,
          seedVersion: SEED_VERSION,
        });
      }

      const existingMissionIds = new Set(
        (await database.missions.toCollection().primaryKeys()).map(String),
      );
      const missingMissions = createSeedMissions(timestamp)
        .filter((mission) => !existingMissionIds.has(mission.id))
        .map(
          (mission) =>
            monthlyMissionSchema.parse(mission) as MonthlyMission,
        );
      if (missingMissions.length > 0) {
        await database.missions.bulkAdd(missingMissions);
      }
    },
  );
}
