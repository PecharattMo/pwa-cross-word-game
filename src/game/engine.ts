export type CategoryId =
  | "food"
  | "travel"
  | "accommodations"
  | "attractions";

export type Difficulty = "easy" | "medium" | "hard";

export type VocabularyWord = {
  id: string;
  word: string;
  thai: string;
  definition: string;
};

export type Level = {
  id: string;
  category: CategoryId;
  difficulty: Difficulty;
  words: VocabularyWord[];
};

export type GameStatus = "playing" | "complete" | "timeout";

export type Game = {
  level: Level;
  status: GameStatus;
  solvedWordIds: string[];
  activeWordIndex: number;
  startedAt: number;
  expiresAt: number;
};

export type SubmissionResult = {
  kind: "incorrect" | "correct" | "complete" | "inactive";
  game: Game;
};

const TIME_LIMITS: Record<Difficulty, number> = {
  easy: 60,
  medium: 120,
  hard: 180,
};

export function timeLimitSeconds(difficulty: Difficulty) {
  return TIME_LIMITS[difficulty];
}

export function createGame(level: Level, startedAt = Date.now()): Game {
  return {
    level,
    status: "playing",
    solvedWordIds: [],
    activeWordIndex: 0,
    startedAt,
    expiresAt: startedAt + timeLimitSeconds(level.difficulty) * 1_000,
  };
}

export function activeWord(game: Game) {
  return game.level.words[game.activeWordIndex] ?? null;
}

export function normalizeWord(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

export function submitWord(game: Game, submitted: string): SubmissionResult {
  if (game.status !== "playing") {
    return { kind: "inactive", game };
  }

  const target = activeWord(game);
  if (!target || normalizeWord(submitted) !== normalizeWord(target.word)) {
    return { kind: "incorrect", game };
  }

  const solvedWordIds = game.solvedWordIds.includes(target.id)
    ? game.solvedWordIds
    : [...game.solvedWordIds, target.id];
  const isComplete = solvedWordIds.length === game.level.words.length;

  return {
    kind: isComplete ? "complete" : "correct",
    game: {
      ...game,
      solvedWordIds,
      activeWordIndex: isComplete
        ? game.activeWordIndex
        : game.activeWordIndex + 1,
      status: isComplete ? "complete" : "playing",
    },
  };
}

export function expireGame(game: Game): Game {
  return game.status === "playing" ? { ...game, status: "timeout" } : game;
}

export function remainingSeconds(game: Game, now = Date.now()) {
  if (game.status !== "playing") return 0;
  return Math.max(0, Math.ceil((game.expiresAt - now) / 1_000));
}

export function scrambledLetters(word: string) {
  const letters = Array.from(word.toUpperCase());
  if (letters.length < 2) return letters;

  const reversed = [...letters].reverse();
  return reversed.join("") === letters.join("")
    ? [...letters.slice(1), letters[0]]
    : reversed;
}

