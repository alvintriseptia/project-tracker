import { normalizeTags, tagsFromInput } from "../tags";

describe("tags", () => {
  it("trims, removes blanks, and deduplicates without changing first casing", () => {
    expect(normalizeTags([" English ", "", "english", "Career"])).toEqual([
      "English",
      "Career",
    ]);
    expect(tagsFromInput("one, two, ONE")).toEqual(["one", "two"]);
  });
});
