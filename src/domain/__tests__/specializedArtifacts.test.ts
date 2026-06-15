import {
  conversationDetailsSchema,
  devlogDetailsSchema,
  englishDetailsSchema,
  koreanDetailsSchema,
  marathonDetailsSchema,
  tasteDetailsSchema,
} from "../schemas";
import {
  conversationActivityTypes,
  conversationQuestions,
  defaultDetails,
  devlogTemplate,
  devlogTypes,
  englishPracticeTypes,
  englishTemplateOptions,
  englishTemplates,
  getSpecializedWorkflow,
  isSpecializedArtifactType,
  koreanActivityTypes,
  koreanEnjoymentOptions,
  marathonReflectionTypes,
  normalizeLineList,
  oneToFiveRatings,
  specializedArtifactTypes,
  specializedWorkflows,
  tasteCategories,
  wordCount,
} from "../specializedArtifacts";

describe("specialized artifact detail schemas", () => {
  it("parses English practice details and preserves unknown keys", () => {
    const parsed = englishDetailsSchema.parse({
      kind: "english_note",
      practiceType: "technical_explanation",
      topic: "Database transactions",
      durationMinutes: 20,
      confidence: 4,
      notes: "",
      mistakesNoticed: "",
      improvedVersion: "",
      template: "technical_explanation",
      sourceArtifactId: "artifact-1",
    });

    expect(parsed.sourceArtifactId).toBe("artifact-1");
  });

  it("parses Korean learning details", () => {
    expect(
      koreanDetailsSchema.parse({
        kind: "korean_note",
        activityType: "vocabulary_review",
        wordsLearned: [],
        phrasesLearned: [],
        source: "Flash cards",
        durationMinutes: 15,
        enjoyment: "fun",
        notes: "",
      }),
    ).toMatchObject({ kind: "korean_note", wordsLearned: [] });
  });

  it("parses devlog details", () => {
    expect(
      devlogDetailsSchema.parse({
        kind: "devlog",
        devlogType: "product_devlog",
        wordCount: 750,
      }),
    ).toEqual({
      kind: "devlog",
      devlogType: "product_devlog",
      wordCount: 750,
    });
  });

  it("parses taste details with plain-text and HTTP photo references", () => {
    const base = {
      kind: "taste_note",
      category: "coffee_shop",
      customCategory: "",
      location: "",
      rating: 4,
      firstImpression: "Quiet and focused",
      good: "Balanced coffee",
      bad: "Limited seating",
      reasoning: "The atmosphere supports deep work.",
      reusableInsight: "Prefer warm lighting and low music.",
    } as const;

    const parsedPlainReference = tasteDetailsSchema.parse({
      ...base,
      photoReference: "phone album: IMG_1024",
    });

    expect(parsedPlainReference).toMatchObject({
      customCategory: "",
      location: "",
      photoReference: "phone album: IMG_1024",
    });
    expect(
      tasteDetailsSchema.parse({
        ...base,
        photoReference: "https://example.com/photo.jpg",
      }).photoReference,
    ).toBe("https://example.com/photo.jpg");
  });

  it("parses conversation reflection details", () => {
    expect(
      conversationDetailsSchema.parse({
        kind: "conversation_reflection",
        activityType: "career_conversation",
        context: "Coffee with a senior engineer",
        personOrGroup: "Alumni group",
        questionAsked: "What made you effective at staff level?",
        bestInsight: "Write down decisions and their trade-offs.",
        selfObservation: "I interrupted too quickly.",
        improvement: "Pause before asking the next question.",
        followUpAction: "Send a thank-you note.",
        followUpCompleted: false,
      }),
    ).toMatchObject({
      kind: "conversation_reflection",
      followUpCompleted: false,
    });
  });

  it("parses marathon reflection details", () => {
    expect(
      marathonDetailsSchema.parse({
        kind: "marathon_reflection",
        reflectionType: "long_run_reflection",
        distanceKm: 18.5,
        pace: "6:10/km",
        energy: 3,
        mentalCondition: "Steady after the first five kilometers.",
        worked: "Conservative start",
        failed: "Late hydration",
        lesson: "Carry water on runs longer than 90 minutes.",
      }),
    ).toMatchObject({ kind: "marathon_reflection", distanceKm: 18.5 });
  });

  it("rejects ratings outside the 1-5 range", () => {
    const result = tasteDetailsSchema.safeParse({
      kind: "taste_note",
      category: "food_drink",
      rating: 6,
      firstImpression: "Bright",
      good: "Fresh",
      bad: "Expensive",
      reasoning: "Ingredient quality is high.",
      reusableInsight: "Use more acidity.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative duration and distance values", () => {
    expect(
      englishDetailsSchema.safeParse({
        kind: "english_note",
        practiceType: "speaking",
        topic: "Introductions",
        durationMinutes: -1,
        confidence: 3,
        notes: "",
        mistakesNoticed: "",
        improvedVersion: "",
        template: "none",
      }).success,
    ).toBe(false);

    expect(
      marathonDetailsSchema.safeParse({
        kind: "marathon_reflection",
        reflectionType: "training_lesson",
        distanceKm: -0.1,
        energy: 3,
        mentalCondition: "Focused",
        worked: "Warm-up",
        failed: "Pacing",
        lesson: "Start slower.",
      }).success,
    ).toBe(false);
  });

  it("rejects taste photo references with unsafe explicit URL schemes", () => {
    const unsafeReferences = [
      "javascript:alert('unsafe')",
      "java\nscript:alert(1)",
      "java\tscript:alert(1)",
      "java\rscript:alert(1)",
      "\u0001javascript:alert(1)",
    ];

    for (const photoReference of unsafeReferences) {
      const result = tasteDetailsSchema.safeParse({
        kind: "taste_note",
        category: "visual_design",
        photoReference,
        firstImpression: "Bold",
        good: "Clear hierarchy",
        bad: "Low contrast",
        reasoning: "The layout guides attention.",
        reusableInsight: "Keep the hierarchy, raise contrast.",
      });

      expect(result.success).toBe(false);
    }
  });

  it.each([
    [
      "English",
      () =>
        englishDetailsSchema.parse({
          kind: "english_note",
          practiceType: "speaking",
          topic: "Introductions",
          durationMinutes: 10,
          confidence: 3,
          notes: "",
          mistakesNoticed: "",
          improvedVersion: "",
          template: "none",
          compatibleExtra: "preserved",
        }).compatibleExtra,
    ],
    [
      "Korean",
      () =>
        koreanDetailsSchema.parse({
          kind: "korean_note",
          activityType: "listening",
          wordsLearned: [],
          phrasesLearned: [],
          source: "Podcast",
          durationMinutes: 10,
          enjoyment: "neutral",
          notes: "",
          compatibleExtra: "preserved",
        }).compatibleExtra,
    ],
    [
      "devlog",
      () =>
        devlogDetailsSchema.parse({
          kind: "devlog",
          devlogType: "technical_note",
          wordCount: 200,
          compatibleExtra: "preserved",
        }).compatibleExtra,
    ],
    [
      "taste",
      () =>
        tasteDetailsSchema.parse({
          kind: "taste_note",
          category: "product",
          firstImpression: "Useful",
          good: "Focused",
          bad: "Limited",
          reasoning: "It solves one problem well.",
          reusableInsight: "Keep the scope narrow.",
          compatibleExtra: "preserved",
        }).compatibleExtra,
    ],
    [
      "conversation",
      () =>
        conversationDetailsSchema.parse({
          kind: "conversation_reflection",
          activityType: "intentional_question",
          context: "Mentoring session",
          questionAsked: "What should I improve?",
          bestInsight: "Write smaller changes.",
          selfObservation: "I defended the first approach.",
          improvement: "Ask a follow-up before responding.",
          followUpAction: "Review the next change together.",
          followUpCompleted: false,
          compatibleExtra: "preserved",
        }).compatibleExtra,
    ],
    [
      "marathon",
      () =>
        marathonDetailsSchema.parse({
          kind: "marathon_reflection",
          reflectionType: "recovery_note",
          energy: 2,
          mentalCondition: "Tired",
          worked: "Walking",
          failed: "Sleep",
          lesson: "Prioritize recovery.",
          compatibleExtra: "preserved",
        }).compatibleExtra,
    ],
  ])("preserves unknown keys for %s details", (_name, parseExtra) => {
    expect(parseExtra()).toBe("preserved");
  });
});

describe("specialized artifact workflows", () => {
  it("recognizes only the six specialized artifact types", () => {
    expect(specializedArtifactTypes).toEqual([
      "english_note",
      "korean_note",
      "devlog",
      "taste_note",
      "conversation_reflection",
      "marathon_reflection",
    ]);

    for (const type of specializedArtifactTypes) {
      expect(isSpecializedArtifactType(type)).toBe(true);
    }

    expect(isSpecializedArtifactType("weekly_review")).toBe(false);
    expect(isSpecializedArtifactType("")).toBe(false);
  });

  it("defines stable workflow labels, track mappings, and activity defaults", () => {
    expect(specializedWorkflows).toEqual({
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
    });

    for (const type of specializedArtifactTypes) {
      expect(getSpecializedWorkflow(type)).toBe(specializedWorkflows[type]);
    }
  });

  it("exports every stored enum value used by specialized details", () => {
    expect(englishPracticeTypes).toEqual([
      "speaking",
      "writing",
      "voice_recording",
      "technical_explanation",
      "career_answer",
      "reflection",
      "devlog_drafting",
      "mock_interview",
    ]);
    expect(englishTemplateOptions).toEqual([
      "none",
      "technical_explanation",
      "career_answer",
      "weekly_reflection",
    ]);
    expect(koreanActivityTypes).toEqual([
      "vocabulary_review",
      "hangul_reading",
      "listening",
      "short_lesson",
      "grammar_note",
      "media_observation",
      "phrase_collection",
    ]);
    expect(koreanEnjoymentOptions).toEqual(["fun", "neutral", "difficult"]);
    expect(devlogTypes).toEqual([
      "product_devlog",
      "technical_note",
      "weekly_reflection",
      "marathon_essay",
      "learning_note",
      "taste_reflection",
      "conversation_insight",
      "portfolio_post",
    ]);
    expect(tasteCategories).toEqual([
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
    ]);
    expect(conversationActivityTypes).toEqual([
      "intentional_question",
      "deep_conversation",
      "alumni_dinner",
      "career_conversation",
      "friend_conversation",
      "family_conversation",
      "community_conversation",
      "follow_up",
    ]);
    expect(marathonReflectionTypes).toEqual([
      "long_run_reflection",
      "training_lesson",
      "race_preparation",
      "recovery_note",
      "discipline_note",
    ]);
    expect(oneToFiveRatings).toEqual([1, 2, 3, 4, 5]);
  });

  it("creates correctly discriminated fresh defaults for every workflow", () => {
    expect(defaultDetails("english_note")).toEqual({
      kind: "english_note",
      practiceType: "speaking",
      topic: "",
      durationMinutes: 0,
      confidence: 3,
      notes: "",
      mistakesNoticed: "",
      improvedVersion: "",
      template: "none",
    });
    expect(defaultDetails("korean_note")).toEqual({
      kind: "korean_note",
      activityType: "vocabulary_review",
      wordsLearned: [],
      phrasesLearned: [],
      source: "",
      durationMinutes: 0,
      enjoyment: "fun",
      notes: "",
    });
    expect(defaultDetails("devlog")).toEqual({
      kind: "devlog",
      devlogType: "product_devlog",
      wordCount: 0,
    });
    expect(defaultDetails("taste_note")).toEqual({
      kind: "taste_note",
      category: "food_drink",
      rating: 3,
      firstImpression: "",
      good: "",
      bad: "",
      reasoning: "",
      reusableInsight: "",
    });
    expect(defaultDetails("conversation_reflection")).toEqual({
      kind: "conversation_reflection",
      activityType: "intentional_question",
      context: "",
      questionAsked: "",
      bestInsight: "",
      selfObservation: "",
      improvement: "",
      followUpAction: "",
      followUpCompleted: false,
    });
    expect(defaultDetails("marathon_reflection")).toEqual({
      kind: "marathon_reflection",
      reflectionType: "long_run_reflection",
      energy: 3,
      mentalCondition: "",
      worked: "",
      failed: "",
      lesson: "",
    });

    const firstKoreanDefault = defaultDetails("korean_note");
    const secondKoreanDefault = defaultDetails("korean_note");
    firstKoreanDefault.wordsLearned.push("안녕");

    expect(secondKoreanDefault.wordsLearned).toEqual([]);
    expect(firstKoreanDefault).not.toBe(secondKoreanDefault);
  });

  it("exports the approved conversation question bank", () => {
    expect(conversationQuestions).toEqual([
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
    ]);
  });

  it("exposes the approved English and devlog templates", () => {
    expect(Object.keys(englishTemplates)).toEqual([
      "technical_explanation",
      "career_answer",
      "weekly_reflection",
    ]);
    expect(englishTemplates.technical_explanation).toBe(`- What did I explain?
- What was the main idea?
- Which words were difficult?
- How can I explain it better next time?
`);
    expect(englishTemplates.career_answer).toBe(`- Question:
- My answer:
- Weak part:
- Better answer:
- Keywords to remember:
`);
    expect(englishTemplates.weekly_reflection).toBe(`- What happened this week?
- What did I learn?
- What was difficult?
- What will I improve next week?
`);
    expect(devlogTemplate).toBe(`# Devlog Week X — Title

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
`);
  });

  it("normalizes Korean line lists case-sensitively in first-seen order", () => {
    expect(
      normalizeLineList(" 안녕\n\n감사합니다 \n안녕\n Apple\napple\n감사합니다"),
    ).toEqual(["안녕", "감사합니다", "Apple", "apple"]);
    expect(normalizeLineList(" \n\t\n ")).toEqual([]);
  });

  it("counts words separated by any whitespace", () => {
    expect(wordCount("  one   two\nthree\tfour ")).toBe(4);
    expect(wordCount("")).toBe(0);
    expect(wordCount(" \n\t ")).toBe(0);
  });
});
