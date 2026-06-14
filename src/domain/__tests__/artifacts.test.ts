import { artifactSchema } from "../schemas";

describe("artifact schema", () => {
  const base = {
    id: "artifact",
    type: "custom",
    title: "Evidence",
    date: "2026-06-14",
    tags: [],
    status: "drafting",
    content: "Plain text",
    details: { kind: "generic", futureKey: "preserved" },
    createdAt: "2026-06-14T00:00:00.000Z",
    updatedAt: "2026-06-14T00:00:00.000Z",
  };

  it("preserves unknown generic detail keys", () => {
    expect(artifactSchema.parse(base).details).toEqual({
      kind: "generic",
      futureKey: "preserved",
    });
  });

  it("accepts only HTTP(S) external links", () => {
    expect(
      artifactSchema.safeParse({ ...base, externalLink: "javascript:alert(1)" })
        .success,
    ).toBe(false);
    expect(
      artifactSchema.safeParse({ ...base, externalLink: "https://example.com" })
        .success,
    ).toBe(true);
  });
});
