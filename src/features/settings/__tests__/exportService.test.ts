import { initializeDatabase } from "../../../db/initialize";
import { buildActivity } from "../../../test/builders";
import { createTestDatabase } from "../../../test/database";
import { prepareFullBackup } from "../exportService";

describe("backup export", () => {
  it("builds a complete versioned full-backup envelope", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, {
      now: new Date("2026-06-14T00:00:00.000Z"),
      timeZone: "UTC",
    });
    await database.activities.add(buildActivity());

    const backup = await prepareFullBackup(
      database,
      new Date("2026-06-15T00:00:00.000Z"),
    );

    expect(backup.filename).toBe("no-zero-backup-2026-06-15.json");
    expect(backup.envelope).toMatchObject({
      format: "no-zero-backup",
      schemaVersion: 1,
      appVersion: "0.1.0",
      exportedAt: "2026-06-15T00:00:00.000Z",
      selection: { mode: "full" },
    });
    expect(backup.envelope.data.tracks).toHaveLength(6);
    expect(backup.envelope.data.activities).toHaveLength(1);
    expect(backup.envelope.data.artifacts).toEqual([]);
    expect(backup.envelope.data.missions).toHaveLength(7);
    expect(JSON.parse(backup.json)).toEqual(backup.envelope);
    database.close();
  });
});
