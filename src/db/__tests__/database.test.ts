import { initializeDatabase } from "../initialize";
import { createTestDatabase } from "../../test/database";

describe("database initialization", () => {
  it("seeds canonical records and preserves customization", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, {
      now: new Date("2026-06-14T12:00:00.000Z"),
      timeZone: "Asia/Jakarta",
      locale: "en-US",
    });

    expect(await database.tracks.count()).toBe(6);
    expect((await database.settings.get("app"))?.challengeStartDate).toBe(
      "2026-06-14",
    );

    await database.tracks.update("english", { weeklyTarget: 7 });
    await initializeDatabase(database, {
      now: new Date("2026-06-15T12:00:00.000Z"),
      timeZone: "UTC",
    });

    expect(await database.tracks.count()).toBe(6);
    expect((await database.tracks.get("english"))?.weeklyTarget).toBe(7);
    expect((await database.settings.get("app"))?.challengeStartDate).toBe(
      "2026-06-14",
    );
    database.close();
  });
});
