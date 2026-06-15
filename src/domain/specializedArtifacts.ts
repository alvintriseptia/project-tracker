import type {
  ArtifactDetails,
  ArtifactType,
} from "./types";

export const specializedArtifactTypes = [
  "english_note",
  "korean_note",
  "devlog",
  "taste_note",
  "conversation_reflection",
  "marathon_reflection",
] as const satisfies readonly ArtifactType[];

export type SpecializedArtifactType = (typeof specializedArtifactTypes)[number];

type SpecializedDetails<Type extends SpecializedArtifactType> = Extract<
  ArtifactDetails,
  { kind: Type }
>;

type ExhaustiveOptions<
  Union,
  Options extends readonly Union[],
> = Exclude<Union, Options[number]> extends never ? Options : never;

function defineExhaustiveOptions<Union>() {
  return <const Options extends readonly Union[]>(
    options: ExhaustiveOptions<Union, Options>,
  ): Options => options;
}

export const specializedWorkflows = {
  english_note: {
    label: "English practice",
    defaultTrackId: "english",
    createActivityByDefault: true,
  },
  korean_note: {
    label: "Korean learning",
    defaultTrackId: "korean",
    createActivityByDefault: true,
  },
  devlog: {
    label: "Devlog",
    defaultTrackId: "devlog",
    createActivityByDefault: false,
  },
  taste_note: {
    label: "Taste note",
    defaultTrackId: "taste",
    createActivityByDefault: false,
  },
  conversation_reflection: {
    label: "Conversation reflection",
    defaultTrackId: "conversation",
    createActivityByDefault: true,
  },
  marathon_reflection: {
    label: "Marathon reflection",
    createActivityByDefault: true,
  },
} as const satisfies Record<
  SpecializedArtifactType,
  {
    label: string;
    defaultTrackId?: string;
    createActivityByDefault: boolean;
  }
>;

export const englishPracticeTypes =
  defineExhaustiveOptions<
    SpecializedDetails<"english_note">["practiceType"]
  >()([
    "speaking",
    "writing",
    "voice_recording",
    "technical_explanation",
    "career_answer",
    "reflection",
    "devlog_drafting",
    "mock_interview",
  ] as const);

export const englishTemplateOptions =
  defineExhaustiveOptions<SpecializedDetails<"english_note">["template"]>()([
    "none",
    "technical_explanation",
    "career_answer",
    "weekly_reflection",
  ] as const);

export const koreanActivityTypes =
  defineExhaustiveOptions<
    SpecializedDetails<"korean_note">["activityType"]
  >()([
    "vocabulary_review",
    "hangul_reading",
    "listening",
    "short_lesson",
    "grammar_note",
    "media_observation",
    "phrase_collection",
  ] as const);

export const koreanEnjoymentOptions =
  defineExhaustiveOptions<SpecializedDetails<"korean_note">["enjoyment"]>()([
    "fun",
    "neutral",
    "difficult",
  ] as const);

export const devlogTypes =
  defineExhaustiveOptions<SpecializedDetails<"devlog">["devlogType"]>()([
    "product_devlog",
    "technical_note",
    "weekly_reflection",
    "marathon_essay",
    "learning_note",
    "taste_reflection",
    "conversation_insight",
    "portfolio_post",
  ] as const);

export const tasteCategories =
  defineExhaustiveOptions<SpecializedDetails<"taste_note">["category"]>()([
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
  ] as const);

export const conversationActivityTypes =
  defineExhaustiveOptions<
    SpecializedDetails<"conversation_reflection">["activityType"]
  >()([
    "intentional_question",
    "deep_conversation",
    "alumni_dinner",
    "career_conversation",
    "friend_conversation",
    "family_conversation",
    "community_conversation",
    "follow_up",
  ] as const);

export const marathonReflectionTypes =
  defineExhaustiveOptions<
    SpecializedDetails<"marathon_reflection">["reflectionType"]
  >()([
    "long_run_reflection",
    "training_lesson",
    "race_preparation",
    "recovery_note",
    "discipline_note",
  ] as const);

export const oneToFiveRatings =
  defineExhaustiveOptions<
    SpecializedDetails<"english_note">["confidence"]
  >()([1, 2, 3, 4, 5] as const);

export const conversationQuestions = [
  "What skill helped you most after college?",
  "What did you misunderstand about career when you were younger?",
  "What kind of people grow fast in your workplace?",
  "What habit changed your life the most?",
  "What would you do differently if you were 24 again?",
  "What are you currently trying to improve?",
  "What changed your mind recently?",
  "What do most people misunderstand about your work?",
  "What decision helped you most?",
  "What kind of life are you trying to build?",
] as const;

export const englishTemplates = {
  technical_explanation: `- What did I explain?
- What was the main idea?
- Which words were difficult?
- How can I explain it better next time?
`,
  career_answer: `- Question:
- My answer:
- Weak part:
- Better answer:
- Keywords to remember:
`,
  weekly_reflection: `- What happened this week?
- What did I learn?
- What was difficult?
- What will I improve next week?
`,
} as const satisfies Record<
  Exclude<SpecializedDetails<"english_note">["template"], "none">,
  string
>;

export const devlogTemplate = `# Devlog Week X — Title

## What I built
...

## Why it matters
...

## Technical decision
...

## Problem I faced
...

## What I learned
...

## Next step
...
`;

export type SpecializedArtifactDetails =
  SpecializedDetails<SpecializedArtifactType>;

const defaultDetailFactories = {
  english_note: (): SpecializedDetails<"english_note"> => ({
    kind: "english_note",
    practiceType: englishPracticeTypes[0],
    topic: "",
    durationMinutes: 0,
    confidence: 3,
    notes: "",
    mistakesNoticed: "",
    improvedVersion: "",
    template: englishTemplateOptions[0],
  }),
  korean_note: (): SpecializedDetails<"korean_note"> => ({
    kind: "korean_note",
    activityType: koreanActivityTypes[0],
    wordsLearned: [],
    phrasesLearned: [],
    source: "",
    durationMinutes: 0,
    enjoyment: koreanEnjoymentOptions[0],
    notes: "",
  }),
  devlog: (): SpecializedDetails<"devlog"> => ({
    kind: "devlog",
    devlogType: devlogTypes[0],
    wordCount: 0,
  }),
  taste_note: (): SpecializedDetails<"taste_note"> => ({
    kind: "taste_note",
    category: tasteCategories[0],
    rating: 3,
    firstImpression: "",
    good: "",
    bad: "",
    reasoning: "",
    reusableInsight: "",
  }),
  conversation_reflection:
    (): SpecializedDetails<"conversation_reflection"> => ({
      kind: "conversation_reflection",
      activityType: conversationActivityTypes[0],
      context: "",
      questionAsked: "",
      bestInsight: "",
      selfObservation: "",
      improvement: "",
      followUpAction: "",
      followUpCompleted: false,
    }),
  marathon_reflection: (): SpecializedDetails<"marathon_reflection"> => ({
    kind: "marathon_reflection",
    reflectionType: marathonReflectionTypes[0],
    energy: 3,
    mentalCondition: "",
    worked: "",
    failed: "",
    lesson: "",
  }),
} satisfies {
  [Type in SpecializedArtifactType]: () => SpecializedDetails<Type>;
};

export function defaultDetails<Type extends SpecializedArtifactType>(
  type: Type,
): SpecializedDetails<Type>;
export function defaultDetails(
  type: SpecializedArtifactType,
): SpecializedArtifactDetails {
  return defaultDetailFactories[type]();
}

export function normalizeLineList(input: string): string[] {
  return [
    ...new Set(
      input
        .split(/\r\n?|\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    ),
  ];
}

export function wordCount(input: string): number {
  const normalized = input.trim();
  return normalized === "" ? 0 : normalized.split(/\s+/).length;
}

export function isSpecializedArtifactType(
  value: string,
): value is SpecializedArtifactType {
  return specializedArtifactTypes.some((type) => type === value);
}

export function getSpecializedWorkflow<Type extends SpecializedArtifactType>(
  type: Type,
): (typeof specializedWorkflows)[Type] {
  return specializedWorkflows[type];
}
