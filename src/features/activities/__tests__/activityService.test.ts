import { ActivityRepository } from "../../../db/repositories";
import { initializeDatabase } from "../../../db/initialize";
import { createTestDatabase } from "../../../test/database";
import { saveActivity } from "../activityService";

describe("activity service", () => {
  it("creates and edits an activity while preserving its identity and creation time", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    const repository = new ActivityRepository(database);
    const track = await database.tracks.get("english");
    expect(track).toBeDefined();

    const created = await saveActivity({
      repository,
      track: track!,
      now: new Date("2026-06-14T08:00:00.000Z"),
      values: {
        trackId: "english",
        level: "minimum",
        title: " Speak for three minutes ",
        date: "2026-06-14",
        note: "",
        points: 2,
        bonusPoints: 0,
        tags: "Career, career",
      },
    });
    const updated = await saveActivity({
      repository,
      track: { ...track!, defaultPoints: 9 },
      existing: created,
      now: new Date("2026-06-14T09:00:00.000Z"),
      values: {
        trackId: "english",
        level: "normal",
        title: "Technical explanation",
        date: "2026-06-14",
        note: "Clearer than yesterday",
        points: created.points,
        bonusPoints: 1,
        tags: "Career",
      },
    });

    expect(updated).toMatchObject({
      id: created.id,
      createdAt: created.createdAt,
      updatedAt: "2026-06-14T09:00:00.000Z",
      points: 2,
      bonusPoints: 1,
      tags: ["Career"],
    });
    database.close();
  });

  it("does not write invalid activity input", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    const repository = new ActivityRepository(database);
    const track = await database.tracks.get("english");

    await expect(
      saveActivity({
        repository,
        track: track!,
        values: {
          trackId: "english",
          level: "minimum",
          title: "",
          date: "2026-06-14",
          note: "",
          points: 2,
          bonusPoints: 0,
          tags: "",
        },
      }),
    ).rejects.toBeDefined();
    expect(await database.activities.count()).toBe(0);
    database.close();
  });
});
