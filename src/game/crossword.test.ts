import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { createCrosswordLayout } from "./crossword";

describe("crossword layout", () => {
  it("keeps every letter from every word", () => {
    const layout = createCrosswordLayout(levels[0].words);

    for (const word of levels[0].words) {
      const placement = layout.placements.find((item) => item.wordId === word.id);
      expect(placement?.word).toBe(word.word.toUpperCase());
    }
  });

  it("creates shared crossing cells", () => {
    const layout = createCrosswordLayout(levels[0].words);
    expect(layout.cells.some((cell) => cell.wordIds.length > 1)).toBe(true);
  });

  it("lays out every shipped level without conflicting letters", () => {
    for (const level of levels) {
      const layout = createCrosswordLayout(level.words);
      expect(layout.placements).toHaveLength(level.words.length);
      expect(layout.rows).toBeGreaterThan(0);
      expect(layout.columns).toBeGreaterThan(0);
      for (const cell of layout.cells) {
        expect(cell.letter).toMatch(/^[A-Z]$/);
      }
    }
  });

  it("provides an English clue for every playable word", () => {
    for (const level of levels) {
      for (const word of level.words) {
        expect(word.definition.length).toBeGreaterThan(12);
      }
    }
  });
});
