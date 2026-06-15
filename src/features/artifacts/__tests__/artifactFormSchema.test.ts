import { defaultDetails } from "../../../domain/specializedArtifacts";
import { artifactFormSchema } from "../artifactFormSchema";

const sharedFields = {
  title: "Artifact title",
  date: "2026-06-15",
  trackId: "",
  tags: "",
  status: "drafting",
  content: "",
  externalLink: "",
  createActivity: false,
} as const;

describe("artifact form schema", () => {
  it("parses specialized details that match the selected type", () => {
    const details = defaultDetails("english_note");
    details.topic = "Database transactions";

    expect(
      artifactFormSchema.parse({
        ...sharedFields,
        type: "english_note",
        details,
      }),
    ).toMatchObject({
      type: "english_note",
      details: {
        kind: "english_note",
        topic: "Database transactions",
      },
    });
  });

  it("rejects specialized details that do not match the selected type", () => {
    expect(
      artifactFormSchema.safeParse({
        ...sharedFields,
        type: "english_note",
        details: defaultDetails("korean_note"),
      }).success,
    ).toBe(false);
  });

  it("parses a non-specialized custom artifact with generic details", () => {
    expect(
      artifactFormSchema.parse({
        ...sharedFields,
        type: "custom",
        details: { kind: "generic" },
      }),
    ).toMatchObject({
      type: "custom",
      details: { kind: "generic" },
    });
  });

  it("rejects unsafe external links", () => {
    expect(
      artifactFormSchema.safeParse({
        ...sharedFields,
        type: "custom",
        details: { kind: "generic" },
        externalLink: "javascript:alert('unsafe')",
      }).success,
    ).toBe(false);
  });
});
