import type {
  Activity,
  Artifact,
  LocalDate,
  MonthlyMission,
} from "../domain/types";
import type { NoZeroDatabase } from "./database";

export async function putArtifactWithLinks(input: {
  database: NoZeroDatabase;
  artifact: Artifact;
  linkedActivityIds: string[];
  createdActivity?: Activity;
}): Promise<void> {
  await input.database.transaction(
    "rw",
    input.database.artifacts,
    input.database.activities,
    async () => {
      const previous = await input.database.artifacts.get(input.artifact.id);
      const previousLinked = previous
        ? await input.database.activities
            .filter((activity) => activity.artifactIds.includes(previous.id))
            .toArray()
        : [];
      const targetIds = new Set(input.linkedActivityIds);
      if (input.createdActivity) targetIds.add(input.createdActivity.id);

      await input.database.artifacts.put(input.artifact);
      if (input.createdActivity) {
        await input.database.activities.put({
          ...input.createdActivity,
          artifactIds: [
            ...new Set([
              ...input.createdActivity.artifactIds,
              input.artifact.id,
            ]),
          ],
        });
      }
      const candidates = new Map(
        previousLinked.map((activity) => [activity.id, activity]),
      );
      for (const id of targetIds) {
        const activity =
          candidates.get(id) ?? (await input.database.activities.get(id));
        if (!activity) continue;
        await input.database.activities.put({
          ...activity,
          artifactIds: targetIds.has(id)
            ? [...new Set([...activity.artifactIds, input.artifact.id])]
            : activity.artifactIds,
          updatedAt: input.artifact.updatedAt,
        });
      }
      for (const activity of previousLinked) {
        if (!targetIds.has(activity.id)) {
          await input.database.activities.put({
            ...activity,
            artifactIds: activity.artifactIds.filter(
              (id) => id !== input.artifact.id,
            ),
            updatedAt: input.artifact.updatedAt,
          });
        }
      }
    },
  );
}

export async function deleteArtifactAndCleanLinks(
  database: NoZeroDatabase,
  artifactId: string,
  timestamp: string,
): Promise<void> {
  await database.transaction(
    "rw",
    database.artifacts,
    database.activities,
    database.missions,
    async () => {
      const activities = await database.activities
        .filter((activity) => activity.artifactIds.includes(artifactId))
        .toArray();
      const missions = await database.missions
        .filter(
          (mission) =>
            mission.targetArtifactIds.includes(artifactId) ||
            mission.reviewArtifactId === artifactId,
        )
        .toArray();
      for (const activity of activities) {
        await database.activities.put({
          ...activity,
          artifactIds: activity.artifactIds.filter((id) => id !== artifactId),
          updatedAt: timestamp,
        });
      }
      for (const mission of missions) {
        const next: MonthlyMission = {
          ...mission,
          targetArtifactIds: mission.targetArtifactIds.filter(
            (id) => id !== artifactId,
          ),
          updatedAt: timestamp,
        };
        if (next.reviewArtifactId === artifactId) delete next.reviewArtifactId;
        await database.missions.put(next);
      }
      await database.artifacts.delete(artifactId);
    },
  );
}

export async function findWeeklyReview(
  database: NoZeroDatabase,
  weekStart: LocalDate,
): Promise<Artifact | undefined> {
  return database.artifacts
    .where("type")
    .equals("weekly_review")
    .filter(
      (artifact) =>
        artifact.status !== "archived" &&
        artifact.details.kind === "weekly_review" &&
        artifact.details.weekStart === weekStart,
    )
    .first();
}

export async function findMonthlyReview(
  database: NoZeroDatabase,
  month: string,
): Promise<Artifact | undefined> {
  return database.artifacts
    .where("type")
    .equals("monthly_review")
    .filter(
      (artifact) =>
        artifact.status !== "archived" &&
        artifact.details.kind === "monthly_review" &&
        artifact.details.month === month,
    )
    .first();
}
