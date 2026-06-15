import {
  conversationDetailsSchema,
  devlogDetailsSchema,
  englishDetailsSchema,
  koreanDetailsSchema,
  marathonDetailsSchema,
  tasteDetailsSchema,
} from "../schemas";

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
    const result = tasteDetailsSchema.safeParse({
      kind: "taste_note",
      category: "visual_design",
      photoReference: "javascript:alert('unsafe')",
      firstImpression: "Bold",
      good: "Clear hierarchy",
      bad: "Low contrast",
      reasoning: "The layout guides attention.",
      reusableInsight: "Keep the hierarchy, raise contrast.",
    });

    expect(result.success).toBe(false);
  });
});
