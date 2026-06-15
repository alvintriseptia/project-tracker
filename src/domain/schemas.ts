import { z } from "zod";

import { isLocalDate } from "./dates";
import { normalizeTags } from "./tags";

const requiredText = z.string().trim().min(1);
const instantSchema = z.iso.datetime({ offset: true });
const localDateSchema = z.string().refine(isLocalDate, "Use a real date in YYYY-MM-DD format.");
const nonNegativeInteger = z.number().int().min(0);
const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM format.");
const oneToFiveInteger = z.number().int().min(1).max(5);

export const optionalHttpOrText = z
  .string()
  .refine((value) => {
    const trimmed = value.trim();
    const explicitScheme = /^[a-z][a-z0-9+.-]*:/i.exec(trimmed);

    if (!explicitScheme) {
      return true;
    }

    if (!/^https?:$/i.test(explicitScheme[0])) {
      return false;
    }

    try {
      return ["http:", "https:"].includes(new URL(trimmed).protocol);
    } catch {
      return false;
    }
  }, "Use plain text or a valid HTTP(S) URL.")
  .optional();

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

export const weeklyReviewDetailsSchema = z.object({
  kind: z.literal("weekly_review"),
  weekStart: localDateSchema,
  weekEnd: localDateSchema,
  wentWell: z.string(),
  skippedOrAvoided: z.string(),
  bestArtifactId: requiredText.optional(),
  weakestTrackId: requiredText.optional(),
  consistencyHelp: z.string(),
  consistencyBlocker: z.string(),
  nextWeekPriority: z.string(),
});

export const monthlyReviewDetailsSchema = z.object({
  kind: z.literal("monthly_review"),
  month: yearMonthSchema,
  majorProgress: z.string(),
  unfinishedWork: z.string(),
  strongestTrackId: requiredText.optional(),
  weakestTrackId: requiredText.optional(),
  bestArtifactId: requiredText.optional(),
  mainLesson: z.string(),
  nextMonthFocus: z.string(),
});

export const englishArtifactDetailsSchema = z
  .object({
    kind: z.literal("english_note"),
    practiceType: z.enum([
      "speaking",
      "writing",
      "voice_recording",
      "technical_explanation",
      "career_answer",
      "reflection",
      "devlog_drafting",
      "mock_interview",
    ]),
    topic: requiredText,
    durationMinutes: nonNegativeInteger,
    confidence: oneToFiveInteger,
    notes: z.string(),
    mistakesNoticed: z.string(),
    improvedVersion: z.string(),
    template: z.enum([
      "none",
      "technical_explanation",
      "career_answer",
      "weekly_reflection",
    ]),
  })
  .catchall(z.unknown());

export const koreanArtifactDetailsSchema = z
  .object({
    kind: z.literal("korean_note"),
    activityType: z.enum([
      "vocabulary_review",
      "hangul_reading",
      "listening",
      "short_lesson",
      "grammar_note",
      "media_observation",
      "phrase_collection",
    ]),
    wordsLearned: z.array(z.string()),
    phrasesLearned: z.array(z.string()),
    source: requiredText,
    durationMinutes: nonNegativeInteger,
    enjoyment: z.enum(["fun", "neutral", "difficult"]),
    notes: z.string(),
  })
  .catchall(z.unknown());

export const devlogArtifactDetailsSchema = z
  .object({
    kind: z.literal("devlog"),
    devlogType: z.enum([
      "product_devlog",
      "technical_note",
      "weekly_reflection",
      "marathon_essay",
      "learning_note",
      "taste_reflection",
      "conversation_insight",
      "portfolio_post",
    ]),
    wordCount: nonNegativeInteger,
  })
  .catchall(z.unknown());

export const tasteArtifactDetailsSchema = z
  .object({
    kind: z.literal("taste_note"),
    category: z.enum([
      "food_drink",
      "place",
      "product",
      "visual_design",
      "storytelling",
      "lifestyle",
      "software_app",
      "city_observation",
      "coffee_shop",
      "custom",
    ]),
    customCategory: requiredText.optional(),
    location: requiredText.optional(),
    rating: oneToFiveInteger.optional(),
    photoReference: optionalHttpOrText,
    firstImpression: requiredText,
    good: requiredText,
    bad: requiredText,
    reasoning: requiredText,
    reusableInsight: requiredText,
  })
  .catchall(z.unknown());

export const conversationArtifactDetailsSchema = z
  .object({
    kind: z.literal("conversation_reflection"),
    activityType: z.enum([
      "intentional_question",
      "deep_conversation",
      "alumni_dinner",
      "career_conversation",
      "friend_conversation",
      "family_conversation",
      "community_conversation",
      "follow_up",
    ]),
    context: requiredText,
    personOrGroup: requiredText.optional(),
    questionAsked: requiredText,
    bestInsight: requiredText,
    selfObservation: requiredText,
    improvement: requiredText,
    followUpAction: requiredText,
    followUpCompleted: z.boolean(),
  })
  .catchall(z.unknown());

export const marathonArtifactDetailsSchema = z
  .object({
    kind: z.literal("marathon_reflection"),
    reflectionType: z.enum([
      "long_run_reflection",
      "training_lesson",
      "race_preparation",
      "recovery_note",
      "discipline_note",
    ]),
    distanceKm: z.number().min(0).optional(),
    pace: requiredText.optional(),
    energy: oneToFiveInteger,
    mentalCondition: requiredText,
    worked: requiredText,
    failed: requiredText,
    lesson: requiredText,
  })
  .catchall(z.unknown());

export const genericArtifactDetailsSchema = z
  .object({ kind: z.literal("generic") })
  .catchall(z.unknown());

export const artifactDetailsSchema = z.union([
  weeklyReviewDetailsSchema,
  monthlyReviewDetailsSchema,
  englishArtifactDetailsSchema,
  koreanArtifactDetailsSchema,
  devlogArtifactDetailsSchema,
  tasteArtifactDetailsSchema,
  conversationArtifactDetailsSchema,
  marathonArtifactDetailsSchema,
  genericArtifactDetailsSchema,
]);

export const artifactSchema = z.object({
  id: requiredText,
  type: z.enum([
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
  ]),
  title: requiredText,
  date: localDateSchema,
  trackId: requiredText.optional(),
  tags: z.array(z.string()).transform(normalizeTags),
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
    .url()
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol))
    .optional(),
  details: artifactDetailsSchema,
  createdAt: instantSchema,
  updatedAt: instantSchema,
});

export const missionChecklistItemSchema = z.object({
  id: requiredText,
  label: requiredText,
  completed: z.boolean(),
  completedAt: instantSchema.optional(),
});

export const monthlyMissionSchema = z.object({
  id: requiredText,
  month: yearMonthSchema,
  title: requiredText,
  theme: requiredText,
  description: z.string().optional(),
  checklist: z.array(missionChecklistItemSchema),
  targetArtifactIds: z.array(requiredText),
  notes: z.string(),
  reviewArtifactId: requiredText.optional(),
  completed: z.boolean(),
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

export { instantSchema, localDateSchema, yearMonthSchema };
