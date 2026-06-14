import { artifactSchema } from "../../domain/schemas";
import type { Artifact } from "../../domain/types";
import { buildActivity } from "../../test/builders";
import { createTestDatabase } from "../../test/database";
import { initializeDatabase } from "../initialize";
import { deleteArtifactAndCleanLinks, putArtifactWithLinks } from "../relationships";

const timestamp = "2026-06-14T00:00:00.000Z";
const artifact = artifactSchema.parse({
  id: "artifact",
  type: "custom",
  title: "Evidence",
  date: "2026-06-14",
  tags: [],
  status: "drafting",
  content: "",
  details: { kind: "generic" },
  createdAt: timestamp,
  updatedAt: timestamp,
}) as Artifact;

describe("artifact relationships", () => {
  it("writes reciprocal activity links and cleans mission references", async () => {
    const database = createTestDatabase();
    await initializeDatabase(database, { timeZone: "UTC" });
    await database.activities.add(buildActivity());
    await putArtifactWithLinks({
      database,
      artifact,
      linkedActivityIds: ["activity-1"],
    });
    expect((await database.activities.get("activity-1"))?.artifactIds).toEqual(["artifact"]);
    const mission = await database.missions.get("2026-06");
    await database.missions.put({
      ...mission!,
      targetArtifactIds: ["artifact"],
      reviewArtifactId: "artifact",
    });
    await deleteArtifactAndCleanLinks(database, "artifact", timestamp);
    expect((await database.activities.get("activity-1"))?.artifactIds).toEqual([]);
    expect(await database.missions.get("2026-06")).toMatchObject({
      targetArtifactIds: [],
    });
    expect((await database.missions.get("2026-06"))?.reviewArtifactId).toBeUndefined();
    database.close();
  });
});
