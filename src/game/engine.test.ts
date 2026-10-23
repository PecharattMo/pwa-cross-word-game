import { describe, expect, it } from "vitest";
import {
  createGame,
  expireGame,
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
    expect(timeLimitSeconds("medium")).toBe(90);
    expect(timeLimitSeconds("hard")).toBe(120);
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

