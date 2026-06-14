import { initializeDatabase } from "../../../db/initialize";
import { createTestDatabase } from "../../../test/database";
import { saveGenericArtifact } from "../artifactService";

describe("generic artifact service", () => {
  it("creates an artifact and explicitly requested linked activity atomically", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    const track = await database.tracks.get("english");
    const artifact = await saveGenericArtifact({
      database,
      track: track!,
      values: {
        title: "Technical note",
        type: "english_note",
        date: "2026-06-14",
        trackId: "english",
        tags: "career",
        status: "drafting",
        content: "Evidence",
        externalLink: "",
        createActivity: true,
      },
    });
    expect(await database.artifacts.get(artifact.id)).toBeDefined();
    const activity = await database.activities.where("trackId").equals("english").first();
    expect(activity?.artifactIds).toContain(artifact.id);
    database.close();
  });
});
