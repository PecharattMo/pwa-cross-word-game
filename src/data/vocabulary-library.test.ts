import { describe, expect, it } from "vitest";
import { allLevels, getLevel, vocabularyCount } from "./levels";

describe("vocabulary library", () => {
  it("ships more than one thousand unique practical terms", () => {
    expect(vocabularyCount).toBeGreaterThan(1_000);
  });

  it("keeps each level within the agreed word limit", () => {
    for (const level of allLevels) {
      expect(level.words.length).toBeGreaterThanOrEqual(5);
      expect(level.words.length).toBeLessThanOrEqual(15);
    }
  });

  it("includes a Thai translation and English clue for every word", () => {
    for (const level of allLevels) {
      for (const word of level.words) {
        expect(word.thai.trim().length).toBeGreaterThan(0);
        expect(word.definition.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("moves to the next level after a level is completed", () => {
    const first = getLevel("food", "easy");
    const next = getLevel("food", "easy", [first.id]);

    expect(next.id).not.toBe(first.id);
  });
});
