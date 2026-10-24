import { describe, expect, it } from "vitest";
import { allLevels } from "../data/levels";
import {
  createGame,
  expireGame,
  scrambledLetters,
  submitWord,
  timeLimitSeconds,
  type Level,
} from "./engine";

const level: Level = {
  id: "food-easy-1",
  category: "food",
  difficulty: "easy",
  words: [
    {
      id: "menu",
      word: "menu",
      thai: "เมนู",
      definition: "a list of food and drinks you can order",
    },
    {
      id: "meal",
      word: "meal",
      thai: "มื้ออาหาร",
      definition: "food eaten at a regular time of day",
    },
  ],
};

describe("timeLimitSeconds", () => {
  it("uses the agreed timer for every difficulty", () => {
    expect(timeLimitSeconds("easy")).toBe(60);
    expect(timeLimitSeconds("medium")).toBe(120);
    expect(timeLimitSeconds("hard")).toBe(180);
  });
});

describe("scrambledLetters", () => {
  it("does not use the answer, its reverse, or a simple rotation", () => {
    const word = "BED";
    const scrambled = scrambledLetters(word, () => 0.25).join("");
    const rotations = ["BED", "EDB", "DBE"];

    expect(scrambled.split("").sort()).toEqual(word.split("").sort());
    expect(rotations).not.toContain(scrambled);
    expect(scrambled).not.toBe("DEB");
  });

  it("adds a distractor when repeated letters have no useful permutation", () => {
    const scrambled = scrambledLetters("ZOO", () => 0.25);

    expect(scrambled).toHaveLength(4);
    expect(scrambled).toEqual(expect.arrayContaining(["Z", "O", "O"]));
  });

  it("avoids predictable orders for every playable word", () => {
    const playableWords = new Map(
      allLevels.flatMap((item) => item.words.map((word) => [word.id, word.word] as const)),
    );

    for (const word of playableWords.values()) {
      const original = Array.from(word.toUpperCase());
      const scrambled = scrambledLetters(word, () => 0.25);
      const availableCounts = new Map<string, number>();
      scrambled.forEach((letter) =>
        availableCounts.set(letter, (availableCounts.get(letter) ?? 0) + 1),
      );
      for (const letter of original) {
        const remaining = availableCounts.get(letter) ?? 0;
        expect(remaining).toBeGreaterThan(0);
        availableCounts.set(letter, remaining - 1);
      }

      if (scrambled.length === original.length) {
        const forbidden = new Set<string>();
        for (let offset = 0; offset < original.length; offset += 1) {
          forbidden.add(
            [...original.slice(offset), ...original.slice(0, offset)].join(""),
          );
        }
        forbidden.add([...original].reverse().join(""));
        expect(forbidden.has(scrambled.join("")), word).toBe(false);
      }
    }
  });
});

describe("game engine", () => {
  it("does not solve a word when the submitted letters are wrong", () => {
    const game = createGame(level, 1_000);
    const result = submitWord(game, "moon");

    expect(result.kind).toBe("incorrect");
    expect(result.game.solvedWordIds).toEqual([]);
    expect(result.game.activeWordIndex).toBe(0);
  });

  it("solves the active word and advances to the next word", () => {
    const game = createGame(level, 1_000);
    const result = submitWord(game, "MENU");

    expect(result.kind).toBe("correct");
    expect(result.game.solvedWordIds).toEqual(["menu"]);
    expect(result.game.activeWordIndex).toBe(1);
    expect(result.game.status).toBe("playing");
  });

  it("completes only after every target word is solved", () => {
    const game = createGame(level, 1_000);
    const afterMenu = submitWord(game, "menu").game;
    const result = submitWord(afterMenu, "meal");

    expect(result.kind).toBe("complete");
    expect(result.game.solvedWordIds).toEqual(["menu", "meal"]);
    expect(result.game.status).toBe("complete");
  });

  it("moves a playing game to timeout without solving more words", () => {
    const game = createGame(level, 1_000);
    const result = expireGame(game);

    expect(result.status).toBe("timeout");
    expect(result.solvedWordIds).toEqual([]);
  });
});

