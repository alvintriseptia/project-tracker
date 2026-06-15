import { z } from "zod";

import { isLocalDate } from "../../domain/dates";
import {
  conversationDetailsSchema,
  devlogDetailsSchema,
  englishDetailsSchema,
  genericArtifactDetailsSchema,
  koreanDetailsSchema,
  marathonDetailsSchema,
  tasteDetailsSchema,
} from "../../domain/schemas";

export const artifactTypes = [
  "devlog",
  "taste_note",
  "conversation_reflection",
  "english_note",
  "korean_note",
  "vinance_milestone",
  "weekly_review",
  "monthly_review",
  "marathon_reflection",
  "custom",
] as const;

const sharedArtifactFormFields = {
  title: z.string().trim().min(1, "Enter a title."),
  date: z.string().refine(isLocalDate, "Choose a valid date."),
  trackId: z.string(),
  tags: z.string(),
  status: z.enum([
    "idea",
    "drafting",
    "reviewed",
    "published",
    "completed",
    "archived",
  ]),
  content: z.string(),
  externalLink: z
    .string()
    .refine((value) => {
      if (!value.trim()) return true;
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Use an HTTP or HTTPS link."),
  createActivity: z.boolean(),
};

export const artifactFormSchema = z.discriminatedUnion("type", [
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("english_note"),
    details: englishDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("korean_note"),
    details: koreanDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("devlog"),
    details: devlogDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("taste_note"),
    details: tasteDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("conversation_reflection"),
    details: conversationDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("marathon_reflection"),
    details: marathonDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("vinance_milestone"),
    details: genericArtifactDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("weekly_review"),
    details: genericArtifactDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("monthly_review"),
    details: genericArtifactDetailsSchema,
  }),
  z.object({
    ...sharedArtifactFormFields,
    type: z.literal("custom"),
    details: genericArtifactDetailsSchema,
  }),
]);

export type ArtifactFormInput = z.input<typeof artifactFormSchema>;
export type ArtifactFormValues = z.output<typeof artifactFormSchema>;
