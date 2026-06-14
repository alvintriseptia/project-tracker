import { z } from "zod";

import { isLocalDate } from "./dates";
import { normalizeTags } from "./tags";

const requiredText = z.string().trim().min(1);
const instantSchema = z.iso.datetime({ offset: true });
const localDateSchema = z.string().refine(isLocalDate, "Use a real date in YYYY-MM-DD format.");
const nonNegativeInteger = z.number().int().min(0);

export const trackSchema = z.object({
  id: requiredText,
  slug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: requiredText,
  description: z.string().trim(),
  icon: requiredText,
  color: requiredText,
  status: z.enum(["active", "archived"]),
  sortOrder: z.number().int(),
  defaultPoints: nonNegativeInteger,
  weeklyTarget: nonNegativeInteger,
  minimumAction: requiredText,
  normalAction: requiredText,
  strongAction: requiredText,
  endOfYearGoal: z.string().trim().min(1).optional(),
  countsTowardNoZero: z.boolean(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
});

export const activitySchema = z.object({
  id: requiredText,
  date: localDateSchema,
  trackId: requiredText,
  level: z.enum(["minimum", "normal", "strong"]),
  title: requiredText,
  note: z.string().trim().min(1).optional(),
  durationMinutes: z.number().int().positive().optional(),
  points: nonNegativeInteger,
  bonusPoints: nonNegativeInteger,
  tags: z.array(z.string()).transform(normalizeTags),
  artifactIds: z.array(requiredText),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
});

export const appSettingsSchema = z
  .object({
    id: z.literal("app"),
    challengeStartDate: localDateSchema,
    challengeEndDate: localDateSchema,
    weekStartsOn: z.enum(["monday", "sunday"]),
    locale: requiredText,
    timeZone: requiredText,
    theme: z.enum(["light", "dark", "system"]),
    weeklyThresholds: z.object({
      minimumWin: nonNegativeInteger,
      goodWeek: nonNegativeInteger,
      excellentWeek: nonNegativeInteger,
    }),
    reminders: z.object({
      enabled: z.boolean(),
      dailyTime: z.string().optional(),
      weeklyReviewDay: z.number().int().min(0).max(6).optional(),
      weeklyReviewTime: z.string().optional(),
      monthlyReviewTime: z.string().optional(),
    }),
    updatedAt: instantSchema,
  })
  .superRefine((settings, context) => {
    const { minimumWin, goodWeek, excellentWeek } = settings.weeklyThresholds;
    if (!(minimumWin < goodWeek && goodWeek < excellentWeek)) {
      context.addIssue({
        code: "custom",
        path: ["weeklyThresholds"],
        message: "Thresholds must increase from minimum win to excellent week.",
      });
    }
    if (settings.challengeStartDate > settings.challengeEndDate) {
      context.addIssue({
        code: "custom",
        path: ["challengeEndDate"],
        message: "Challenge end date must be on or after its start date.",
      });
    }
  });

export const databaseMetadataSchema = z.object({
  id: z.literal("database"),
  schemaVersion: z.number().int().positive(),
  seedVersion: z.number().int().positive(),
  initializedAt: instantSchema,
  lastBackupAt: instantSchema.optional(),
});

export { instantSchema, localDateSchema };
