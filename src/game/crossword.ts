import type { VocabularyWord } from "./engine";

export type CrosswordDirection = "across" | "down";

export type CrosswordPlacement = {
  wordId: string;
  word: string;
  row: number;
  col: number;
  direction: CrosswordDirection;
};

export type CrosswordCell = {
  row: number;
  col: number;
  letter: string;
  wordIds: string[];
};

export type CrosswordLayout = {
  rows: number;
  columns: number;
  cells: CrosswordCell[];
  placements: CrosswordPlacement[];
};

type WorkingCell = {
  letter: string;
  wordIds: Set<string>;
  directions: Set<CrosswordDirection>;
};

type Candidate = CrosswordPlacement & {
  intersections: number;
  score: number;
};

const keyFor = (row: number, col: number) => `${row}:${col}`;

function stepFor(direction: CrosswordDirection) {
  return direction === "across"
    ? { row: 0, col: 1 }
    : { row: 1, col: 0 };
}

function boundsFor(placements: CrosswordPlacement[]) {
  if (placements.length === 0) {
    return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };
  }

  let minRow = Number.POSITIVE_INFINITY;
  let maxRow = Number.NEGATIVE_INFINITY;
  let minCol = Number.POSITIVE_INFINITY;
  let maxCol = Number.NEGATIVE_INFINITY;

  for (const placement of placements) {
    const step = stepFor(placement.direction);
    const endRow = placement.row + step.row * (placement.word.length - 1);
    const endCol = placement.col + step.col * (placement.word.length - 1);
    minRow = Math.min(minRow, placement.row, endRow);
    maxRow = Math.max(maxRow, placement.row, endRow);
    minCol = Math.min(minCol, placement.col, endCol);
    maxCol = Math.max(maxCol, placement.col, endCol);
  }

  return { minRow, maxRow, minCol, maxCol };
}

function evaluateCandidate(
  grid: Map<string, WorkingCell>,
  placements: CrosswordPlacement[],
  word: VocabularyWord,
  row: number,
  col: number,
  direction: CrosswordDirection,
) {
  const letters = Array.from(word.word.toUpperCase());
  const step = stepFor(direction);
  let intersections = 0;

  const before = keyFor(row - step.row, col - step.col);
  const after = keyFor(
    row + step.row * letters.length,
    col + step.col * letters.length,
  );
  if (grid.has(before) || grid.has(after)) return null;

  for (let index = 0; index < letters.length; index += 1) {
    const cellRow = row + step.row * index;
    const cellCol = col + step.col * index;
    const existing = grid.get(keyFor(cellRow, cellCol));

    if (existing) {
      if (
        existing.letter !== letters[index] ||
        existing.directions.has(direction)
      ) {
        return null;
      }
      intersections += 1;
      continue;
    }

    const sideA =
      direction === "across"
        ? keyFor(cellRow - 1, cellCol)
        : keyFor(cellRow, cellCol - 1);
    const sideB =
      direction === "across"
        ? keyFor(cellRow + 1, cellCol)
        : keyFor(cellRow, cellCol + 1);
    if (grid.has(sideA) || grid.has(sideB)) return null;
  }

  if (intersections === 0) return null;

  const placement: CrosswordPlacement = {
    wordId: word.id,
    word: word.word.toUpperCase(),
    row,
    col,
    direction,
  };
  const bounds = boundsFor([...placements, placement]);
  const width = bounds.maxCol - bounds.minCol + 1;
  const height = bounds.maxRow - bounds.minRow + 1;

  return {
    ...placement,
    intersections,
    score: intersections * 1_000 - width * height - Math.abs(width - height) * 2,
  } satisfies Candidate;
}

function addPlacement(
  grid: Map<string, WorkingCell>,
  placement: CrosswordPlacement,
) {
  const step = stepFor(placement.direction);
  Array.from(placement.word).forEach((letter, index) => {
    const row = placement.row + step.row * index;
    const col = placement.col + step.col * index;
    const key = keyFor(row, col);
    const existing = grid.get(key);

    if (existing) {
      existing.wordIds.add(placement.wordId);
      existing.directions.add(placement.direction);
    } else {
      grid.set(key, {
        letter,
        wordIds: new Set([placement.wordId]),
        directions: new Set([placement.direction]),
      });
    }
  });
}

function candidatesFor(
  grid: Map<string, WorkingCell>,
  placements: CrosswordPlacement[],
  word: VocabularyWord,
) {
  const candidates: Candidate[] = [];
  const letters = Array.from(word.word.toUpperCase());

  for (const [key, cell] of grid) {
    const [cellRow, cellCol] = key.split(":").map(Number);
    letters.forEach((letter, letterIndex) => {
      if (letter !== cell.letter) return;

      for (const direction of ["across", "down"] as const) {
        const step = stepFor(direction);
        const candidate = evaluateCandidate(
          grid,
          placements,
          word,
          cellRow - step.row * letterIndex,
          cellCol - step.col * letterIndex,
          direction,
        );
        if (candidate) candidates.push(candidate);
      }
    });
  }

  return candidates;
}

export function createCrosswordLayout(words: VocabularyWord[]): CrosswordLayout {
  if (words.length === 0) {
    return { rows: 0, columns: 0, cells: [], placements: [] };
  }

  const grid = new Map<string, WorkingCell>();
  const remaining = [...words].sort(
    (left, right) => right.word.length - left.word.length,
  );
  const first = remaining.shift()!;
  const placements: CrosswordPlacement[] = [
    {
      wordId: first.id,
      word: first.word.toUpperCase(),
      row: 0,
      col: 0,
      direction: "across",
    },
  ];
  addPlacement(grid, placements[0]);

  while (remaining.length > 0) {
    let best: { wordIndex: number; candidate: Candidate } | null = null;

    remaining.forEach((word, wordIndex) => {
      for (const candidate of candidatesFor(grid, placements, word)) {
        if (!best || candidate.score > best.candidate.score) {
          best = { wordIndex, candidate };
        }
      }
    });

    if (!best) {
      const word = remaining.shift()!;
      const bounds = boundsFor(placements);
      const fallback: CrosswordPlacement = {
        wordId: word.id,
        word: word.word.toUpperCase(),
        row: bounds.maxRow + 2,
        col: bounds.minCol,
        direction: "across",
      };
      placements.push(fallback);
      addPlacement(grid, fallback);
      continue;
    }

    const chosen = best as { wordIndex: number; candidate: Candidate };
    remaining.splice(chosen.wordIndex, 1);
    placements.push(chosen.candidate);
    addPlacement(grid, chosen.candidate);
  }

  const bounds = boundsFor(placements);
  const rowOffset = -bounds.minRow;
  const colOffset = -bounds.minCol;
  const normalizedPlacements = placements.map((placement) => ({
    ...placement,
    row: placement.row + rowOffset,
    col: placement.col + colOffset,
  }));
  const cells = [...grid.entries()]
    .map(([key, cell]) => {
      const [row, col] = key.split(":").map(Number);
      return {
        row: row + rowOffset,
        col: col + colOffset,
        letter: cell.letter,
        wordIds: [...cell.wordIds],
      };
    })
    .sort((left, right) => left.row - right.row || left.col - right.col);

  return {
    rows: bounds.maxRow - bounds.minRow + 1,
    columns: bounds.maxCol - bounds.minCol + 1,
    cells,
    placements: normalizedPlacements,
  };
}
