import type { CategoryId, VocabularyWord } from "./engine";

export type KnownWord = {
  id: string;
  category: CategoryId;
};

export type PlayerProgress = {
  playerName: string;
  knownWords: KnownWord[];
  completedLevelIds: string[];
};

export type ScoreSummary = Record<CategoryId, number> & { total: number };

const STORAGE_KEY = "wanderwords-progress-v1";

export function createProgress(playerName: string): PlayerProgress {
  return { playerName: playerName.trim(), knownWords: [], completedLevelIds: [] };
}

export function addSolvedWords(
  progress: PlayerProgress,
  category: CategoryId,
  wordIds: string[],
): PlayerProgress {
  const knownIds = new Set(progress.knownWords.map((known) => known.id));
  const additions = wordIds
    .map((id) => id.toLocaleLowerCase("en-US"))
    .filter((id) => !knownIds.has(id))
    .map((id) => {
      knownIds.add(id);
      return { id, category };
    });

  return { ...progress, knownWords: [...progress.knownWords, ...additions] };
}

export function completeLevel(progress: PlayerProgress, levelId: string) {
  return progress.completedLevelIds.includes(levelId)
    ? progress
    : {
        ...progress,
        completedLevelIds: [...progress.completedLevelIds, levelId],
      };
}

export function scoresFor(progress: PlayerProgress): ScoreSummary {
  const summary: ScoreSummary = {
    food: 0,
    travel: 0,
    accommodations: 0,
    attractions: 0,
    total: progress.knownWords.length,
  };

  for (const known of progress.knownWords) {
    summary[known.category] += 1;
  }

  return summary;
}

export function saveProgress(progress: PlayerProgress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadProgress(): PlayerProgress | null {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const candidate = JSON.parse(saved) as Partial<PlayerProgress>;
    if (
      typeof candidate.playerName !== "string" ||
      !Array.isArray(candidate.knownWords) ||
      !Array.isArray(candidate.completedLevelIds)
    ) {
      return null;
    }

    return candidate as PlayerProgress;
  } catch {
    return null;
  }
}

export function translationRows(words: VocabularyWord[]) {
  return words.map(({ id, word, thai }) => ({ id, word, thai }));
}

