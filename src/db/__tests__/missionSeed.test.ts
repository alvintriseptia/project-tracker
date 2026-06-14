import { initializeDatabase } from "../initialize";
import { createTestDatabase } from "../../test/database";

describe("mission seed version 2", () => {
  it("seeds seven missions and preserves customization", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, {
      now: new Date("2026-06-14T00:00:00.000Z"),
      timeZone: "UTC",
    });
    expect(await database.missions.count()).toBe(7);
    await database.missions.update("2026-06", { title: "My June" });
    await database.missions.delete("2026-07");

    await initializeDatabase(database, {
      now: new Date("2026-06-15T00:00:00.000Z"),
      timeZone: "UTC",
    });

    expect(await database.missions.count()).toBe(7);
    expect((await database.missions.get("2026-06"))?.title).toBe("My June");
    expect((await database.metadata.get("database"))?.seedVersion).toBe(2);
    database.close();
  });
});
