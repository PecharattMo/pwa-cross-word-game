import { describe, expect, it } from "vitest";
import { addSolvedWords, createProgress, scoresFor } from "./progress";

describe("player progress", () => {
  it("awards a word only the first time it is solved", () => {
    const progress = createProgress("Mook");
    const first = addSolvedWords(progress, "food", ["menu"]);
    const repeated = addSolvedWords(first, "food", ["menu"]);

    expect(scoresFor(repeated).food).toBe(1);
    expect(scoresFor(repeated).total).toBe(1);
  });

  it("keeps category scores and a combined total", () => {
    const progress = addSolvedWords(
      addSolvedWords(createProgress("Mook"), "food", ["menu", "meal"]),
      "travel",
      ["train"],
    );

    expect(scoresFor(progress)).toEqual({
      food: 2,
      travel: 1,
      accommodations: 0,
      attractions: 0,
      total: 3,
    });
  });
});

