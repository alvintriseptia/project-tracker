import { z } from "zod";

import { isLocalDate } from "../../domain/dates";

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

export const artifactFormSchema = z.object({
  title: z.string().trim().min(1, "Enter a title."),
  type: z.enum(artifactTypes),
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
});

export type ArtifactFormInput = z.input<typeof artifactFormSchema>;
export type ArtifactFormValues = z.output<typeof artifactFormSchema>;
