import { initializeDatabase } from "../../../db/initialize";
import { buildActivity } from "../../../test/builders";
import { createTestDatabase } from "../../../test/database";
import {
  applyImport,
  prepareFullBackup,
  prepareMarkdownExport,
  prepareSelectedBackup,
  previewImport,
} from "../exportService";

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

describe("selected exports", () => {
  it("filters date-range JSON backups and Markdown reports", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, {
      now: new Date("2026-06-14T00:00:00.000Z"),
      timeZone: "UTC",
    });
    await database.activities.bulkAdd([
      buildActivity({ id: "one", date: "2026-06-14", title: "Inside" }),
      buildActivity({ id: "two", date: "2026-07-01", title: "Outside" }),
    ]);

    const backup = await prepareSelectedBackup(
      database,
      { mode: "date_range", from: "2026-06-01", to: "2026-06-30" },
      new Date("2026-06-15T00:00:00.000Z"),
    );
    const report = await prepareMarkdownExport(
      database,
      { mode: "date_range", from: "2026-06-01", to: "2026-06-30" },
      new Date("2026-06-15T00:00:00.000Z"),
    );

    expect(backup.envelope.selection).toEqual({
      mode: "date_range",
      from: "2026-06-01",
      to: "2026-06-30",
    });
    expect(backup.envelope.data.activities).toMatchObject([{ id: "one" }]);
    expect(report.markdown).toContain("Inside");
    expect(report.markdown).not.toContain("Outside");
    database.close();
  });
});

describe("backup import", () => {
  it("previews and merges valid backup records by updatedAt", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    await database.activities.add(
      buildActivity({
        id: "activity-1",
        title: "Local old",
        updatedAt: "2026-06-14T00:00:00.000Z",
      }),
    );
    const backup = await prepareFullBackup(database, new Date("2026-06-15T00:00:00.000Z"));
    backup.envelope.data.activities[0] = {
      ...backup.envelope.data.activities[0]!,
      title: "Imported new",
      updatedAt: "2026-06-16T00:00:00.000Z",
    };

    const preview = await previewImport(database, JSON.stringify(backup.envelope));
    expect(preview.counts.activities).toEqual({
      create: 0,
      update: 1,
      unchanged: 0,
      conflict: 0,
    });

    await applyImport(database, preview, "merge");
    await expect(database.activities.get("activity-1")).resolves.toMatchObject({
      title: "Imported new",
    });
    database.close();
  });

  it("blocks equal-timestamp conflicts", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    await database.activities.add(
      buildActivity({
        id: "activity-1",
        title: "Local",
        updatedAt: "2026-06-14T00:00:00.000Z",
      }),
    );
    const backup = await prepareFullBackup(database, new Date("2026-06-15T00:00:00.000Z"));
    backup.envelope.data.activities[0] = {
      ...backup.envelope.data.activities[0]!,
      title: "Imported",
      updatedAt: "2026-06-14T00:00:00.000Z",
    };

    const preview = await previewImport(database, JSON.stringify(backup.envelope));

    expect(preview.hasConflicts).toBe(true);
    await expect(applyImport(database, preview, "merge")).rejects.toThrow(
      "Resolve import conflicts",
    );
    database.close();
  });

  it("replaces local records in one restore operation", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    const backup = await prepareFullBackup(database, new Date("2026-06-15T00:00:00.000Z"));
    backup.envelope.data.activities = [
      buildActivity({ id: "imported", title: "Imported only" }),
    ];
    await database.activities.add(buildActivity({ id: "local", title: "Local only" }));

    const preview = await previewImport(database, JSON.stringify(backup.envelope));
    await applyImport(database, preview, "replace");

    await expect(database.activities.toArray()).resolves.toMatchObject([
      { id: "imported" },
    ]);
    database.close();
  });
});
