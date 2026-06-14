import { artifactSchema, activitySchema } from "../../domain/schemas";
import { tagsFromInput } from "../../domain/tags";
import type { Activity, Artifact, Track } from "../../domain/types";
import type { NoZeroDatabase } from "../../db/database";
import { putArtifactWithLinks } from "../../db/relationships";
import type { ArtifactFormValues } from "./artifactFormSchema";

export async function saveGenericArtifact(input: {
  database: NoZeroDatabase;
  values: ArtifactFormValues;
  track?: Track;
  existing?: Artifact;
  linkedActivityIds?: string[];
  now?: Date;
}): Promise<Artifact> {
  const timestamp = (input.now ?? new Date()).toISOString();
  const candidate = {
    id: input.existing?.id ?? crypto.randomUUID(),
    type: input.values.type,
    title: input.values.title.trim(),
    date: input.values.date,
    ...(input.values.trackId ? { trackId: input.values.trackId } : {}),
    tags: tagsFromInput(input.values.tags),
    status: input.values.status,
    content: input.values.content,
    ...(input.values.externalLink.trim()
      ? { externalLink: input.values.externalLink.trim() }
      : {}),
    details:
      input.existing?.details.kind === "generic"
        ? input.existing.details
        : { kind: "generic" as const },
    createdAt: input.existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  const artifact = artifactSchema.parse(candidate) as Artifact;
  let createdActivity: Activity | undefined;
  if (input.values.createActivity) {
    if (!input.track) throw new Error("Choose a project to create an activity.");
    createdActivity = activitySchema.parse({
      id: crypto.randomUUID(),
      date: artifact.date,
      trackId: input.track.id,
      level: "normal",
      title: artifact.title,
      points: input.track.defaultPoints,
      bonusPoints: 0,
      tags: artifact.tags,
      artifactIds: [artifact.id],
      createdAt: timestamp,
      updatedAt: timestamp,
    }) as Activity;
  }
  await putArtifactWithLinks({
    database: input.database,
    artifact,
    linkedActivityIds: input.linkedActivityIds ?? [],
    ...(createdActivity ? { createdActivity } : {}),
  });
  return artifact;
}

export async function setArtifactArchived(input: {
  database: NoZeroDatabase;
  artifact: Artifact;
  archived: boolean;
}): Promise<void> {
  await input.database.artifacts.put({
    ...input.artifact,
    status: input.archived ? "archived" : "drafting",
    updatedAt: new Date().toISOString(),
  });
}
