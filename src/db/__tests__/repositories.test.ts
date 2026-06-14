import { initializeDatabase } from "../initialize";
import {
  ActivityRepository,
  readFullSnapshot,
  TrackRepository,
} from "../repositories";
import { buildActivity } from "../../test/builders";
import { createTestDatabase } from "../../test/database";

describe("repositories", () => {
  it("queries activities by compound track/date index", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    const activities = new ActivityRepository(database);
    await activities.put(buildActivity({ id: "one", date: "2026-06-10" }));
    await activities.put(buildActivity({ id: "two", date: "2026-06-20" }));

    await expect(
      activities.listByTrack("english", {
        from: "2026-06-08",
        to: "2026-06-14",
      }),
    ).resolves.toMatchObject([{ id: "one" }]);
    database.close();
  });

  it("archives tracks without removing history", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    const tracks = new TrackRepository(database);
    const english = await tracks.get("english");
    expect(english).toBeDefined();
    await tracks.put({
      ...english!,
      status: "archived",
      updatedAt: new Date().toISOString(),
    });
    expect((await tracks.get("english"))?.status).toBe("archived");
    database.close();
  });

  it("exports every schema-v1 table in one snapshot", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    await database.activities.add(buildActivity());

    const snapshot = await readFullSnapshot(database);
    expect(snapshot.tracks).toHaveLength(6);
    expect(snapshot.activities).toHaveLength(1);
    expect(snapshot.artifacts).toEqual([]);
    expect(snapshot.settings.id).toBe("app");
    database.close();
  });
});
