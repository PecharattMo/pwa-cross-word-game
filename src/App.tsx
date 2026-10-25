import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  AirplaneTilt,
  ArrowLeft,
  Backspace,
  Bed,
  Binoculars,
  BookOpenText,
  CaretRight,
  ChartBar,
  Check,
  ForkKnife,
  Trophy,
} from "@phosphor-icons/react";
import { getLevel, getVocabularyWord } from "./data/levels";
import { createCrosswordLayout } from "./game/crossword";
import {
  activeWord,
  createGame,
  expireGame,
  remainingSeconds,
  scrambledLetters,
  submitWord,
  type CategoryId,
  type Difficulty,
  type Game,
} from "./game/engine";
import {
  addSolvedWords,
  completeLevel,
  createProgress,
  knownWordsForCategory,
  loadProgress,
  saveProgress,
  scoresFor,
  type PlayerProgress,
} from "./game/progress";

type Screen =
  | "onboarding"
  | "categories"
  | "difficulty"
  | "game"
  | "scores"
  | "score-details";

const categoryMeta: Array<{
  id: CategoryId;
  label: string;
  thai: string;
}> = [
  { id: "food", label: "Food", thai: "อาหารและร้านอาหาร" },
  { id: "travel", label: "Travel", thai: "การเดินทาง" },
  {
    id: "accommodations",
    label: "Accommodations",
    thai: "ที่พักและโรงแรม",
  },
  {
    id: "attractions",
    label: "Attractions",
    thai: "สถานที่ท่องเที่ยว",
  },
];

function CategoryIcon({ id, size = 26 }: { id: CategoryId; size?: number }) {
  const props = { size, weight: "fill" as const, "aria-hidden": true };
  if (id === "food") return <ForkKnife {...props} />;
  if (id === "travel") return <AirplaneTilt {...props} />;
  if (id === "accommodations") return <Bed {...props} />;
  return <Binoculars {...props} />;
}

const difficultyMeta: Array<{
  id: Difficulty;
  label: string;
  time: string;
  description: string;
}> = [
  { id: "easy", label: "Easy", time: "1:00", description: "คำสั้นและคุ้นเคย" },
  {
    id: "medium",
    label: "Medium",
    time: "2:00",
    description: "คำยาวขึ้นและชวนสับสน",
  },
  { id: "hard", label: "Hard", time: "3:00", description: "คำท้าทายสำหรับนักเดินทาง" },
];

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function AppHeader({
  progress,
  onScores,
}: {
  progress: PlayerProgress;
  onScores: () => void;
}) {
  return (
    <header className="topbar">
      <button className="brand-button" type="button" onClick={onScores}>
        WanderWords
      </button>
      <button className="score-pill" type="button" onClick={onScores}>
        <ChartBar size={20} weight="bold" aria-hidden="true" />
        <span>คะแนนรวม</span>
        <strong>{scoresFor(progress).total}</strong>
      </button>
    </header>
  );
}

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress | null>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>(() =>
    loadProgress() ? "categories" : "onboarding",
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("food");
  const [game, setGame] = useState<Game | null>(null);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [scrambleRound, setScrambleRound] = useState(0);

  const currentWord = game ? activeWord(game) : null;
  const letterBank = useMemo(
    () => (currentWord ? scrambledLetters(currentWord.word) : []),
    [currentWord?.id, scrambleRound],
  );
  const answer = selectedLetters.map((index) => letterBank[index]).join("");
  const crossword = useMemo(
    () => (game ? createCrosswordLayout(game.level.words) : null),
    [game?.level.id],
  );

  useEffect(() => {
    if (!game || game.status !== "playing") return;

    const updateTimer = () => {
      const remaining = remainingSeconds(game);
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setGame((current) => (current ? expireGame(current) : current));
      }
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(timer);
  }, [game?.expiresAt, game?.status]);

  useEffect(() => {
    if (feedback !== "ถูกต้อง!") return;

    const clearFeedback = window.setTimeout(() => setFeedback(""), 900);
    return () => window.clearTimeout(clearFeedback);
  }, [feedback]);

  function updateProgress(next: PlayerProgress) {
    setProgress(next);
    saveProgress(next);
  }

  function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("playerName") ?? "").trim();
    if (!name) return;

    updateProgress(createProgress(name));
    setScreen("categories");
  }

  function startGame(difficulty: Difficulty) {
    const nextGame = createGame(
      getLevel(selectedCategory, difficulty, progress?.completedLevelIds ?? []),
    );
    setGame(nextGame);
    setSecondsLeft(remainingSeconds(nextGame));
    setSelectedLetters([]);
    setFeedback("");
    setShowAnswers(false);
    setScrambleRound((current) => current + 1);
    setScreen("game");
  }

  function submitCurrentWord() {
    if (!game || !currentWord || !progress) return;
    const result = submitWord(game, answer);

    if (result.kind === "incorrect") {
      setFeedback("ยังไม่ใช่ ลองเรียงตัวอักษรใหม่อีกครั้ง");
      setSelectedLetters([]);
      return;
    }

    if (result.kind === "correct" || result.kind === "complete") {
      let nextProgress = addSolvedWords(progress, game.level.category, [currentWord.id]);
      if (result.kind === "complete") {
        nextProgress = completeLevel(nextProgress, game.level.id);
      }
      updateProgress(nextProgress);
      setGame(result.game);
      setSelectedLetters([]);
      setFeedback(result.kind === "complete" ? "ผ่านด่านแล้ว!" : "ถูกต้อง!");
    }
  }

  function restartCurrentGame() {
    if (!game) return;
    const restarted = createGame(game.level);
    setGame(restarted);
    setSecondsLeft(remainingSeconds(restarted));
    setSelectedLetters([]);
    setFeedback("");
    setShowAnswers(false);
    setScrambleRound((current) => current + 1);
  }

  if (!progress || screen === "onboarding") {
    return (
      <main className="app-shell onboarding-shell">
        <section className="welcome-card" aria-labelledby="app-title">
          <img
            className="welcome-mascot"
            src={`${import.meta.env.BASE_URL}wanderwords-mascot.png`}
            alt="มาสคอตกระเป๋าเดินทาง WanderWords"
          />
          <p className="eyebrow">English for every journey</p>
          <h1 id="app-title">WanderWords</h1>
          <p className="intro">
            ต่อคำศัพท์ที่คุณจะได้ใช้จริงในร้านอาหาร ระหว่างเดินทาง ที่พัก
            และสถานที่ท่องเที่ยว
          </p>
          <form className="player-form" onSubmit={handleNameSubmit}>
            <label htmlFor="player-name">ชื่อผู้เล่น</label>
            <input
              id="player-name"
              name="playerName"
              type="text"
              placeholder="เช่น Mook"
              autoComplete="nickname"
              maxLength={30}
              required
            />
            <button type="submit">เริ่มการเดินทาง</button>
          </form>
        </section>
      </main>
    );
  }

  const scores = scoresFor(progress);

  if (screen === "scores") {
    const strongest = categoryMeta.reduce((best, category) =>
      scores[category.id] > scores[best.id] ? category : best,
    );

    return (
      <main className="app-shell dashboard-shell">
        <AppHeader progress={progress} onScores={() => setScreen("categories")} />
        <section className="panel score-panel">
          <p className="eyebrow">Your vocabulary passport</p>
          <h2>คะแนนของ {progress.playerName}</h2>
          <div className="total-score">
            <strong>{scores.total}</strong>
            <span>คำที่รู้แล้ว</span>
          </div>
          <div className="score-list">
            {categoryMeta.map((category) => (
              <button
                className="score-row"
                type="button"
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setScreen("score-details");
                }}
                aria-label={`ดูคำศัพท์ที่ได้คะแนนในหมวด ${category.label}`}
              >
                <span className={`category-mark ${category.id}`}>
                  <CategoryIcon id={category.id} />
                </span>
                <div>
                  <strong>{category.label}</strong>
                  <small>{category.thai}</small>
                </div>
                <span className="score-row-value">
                  <b>{scores[category.id]}</b>
                  <CaretRight size={18} weight="bold" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
          {scores.total > 0 && (
            <p className="strength-note">
              ตอนนี้คุณแข็งแรงที่สุดในหมวด <strong>{strongest.label}</strong>
            </p>
          )}
          <button className="primary-button" type="button" onClick={() => setScreen("categories")}>
            เล่นต่อ
          </button>
        </section>
      </main>
    );
  }

  if (screen === "score-details") {
    const category = categoryMeta.find((item) => item.id === selectedCategory)!;
    const earnedWords = knownWordsForCategory(progress, selectedCategory)
      .map((known) =>
        getVocabularyWord(known.id) ?? {
          id: known.id,
          word: known.id,
          thai: "",
          definition: "Meaning is not available for this word yet.",
        },
      )
      .sort((left, right) => left.word.localeCompare(right.word, "en"));

    return (
      <main className="app-shell dashboard-shell">
        <AppHeader progress={progress} onScores={() => setScreen("categories")} />
        <section className="panel score-detail-panel">
          <button className="text-button" type="button" onClick={() => setScreen("scores")}>
            <ArrowLeft size={18} weight="bold" aria-hidden="true" /> กลับไปหน้าคะแนน
          </button>
          <div className="score-detail-heading">
            <span className={`category-mark ${category.id}`}>
              <CategoryIcon id={category.id} />
            </span>
            <div>
              <p className="eyebrow">Words with points</p>
              <h2>{category.label}</h2>
              <p>{earnedWords.length} คำที่ตอบถูกและได้รับคะแนนแล้ว</p>
            </div>
          </div>

          {earnedWords.length > 0 ? (
            <div className="earned-word-list">
              {earnedWords.map((word) => (
                <article className="earned-word-card" key={word.id}>
                  <BookOpenText size={24} weight="duotone" aria-hidden="true" />
                  <div>
                    <h3>{word.word}</h3>
                    <p>{word.definition}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-score-state">
              <BookOpenText size={42} weight="duotone" aria-hidden="true" />
              <strong>ยังไม่มีคำศัพท์ในหมวดนี้</strong>
              <p>เล่นด่านและตอบคำให้ถูก แล้วคำที่ได้คะแนนจะมาอยู่ที่นี่</p>
            </div>
          )}
        </section>
      </main>
    );
  }

  if (screen === "categories") {
    return (
      <main className="app-shell content-shell">
        <AppHeader progress={progress} onScores={() => setScreen("scores")} />
        <section className="panel selection-panel">
          <p className="eyebrow">Welcome, {progress.playerName}</p>
          <h2>วันนี้อยากฝึกเรื่องอะไร?</h2>
          <p className="section-copy">เลือกหมวดคำศัพท์ก่อนเริ่มด่าน</p>
          <div className="category-grid">
            {categoryMeta.map((category) => (
              <button
                className="category-card"
                type="button"
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setScreen("difficulty");
                }}
              >
                <span className={`category-mark ${category.id}`}>
                  <CategoryIcon id={category.id} />
                </span>
                <strong>{category.label}</strong>
                <small>{category.thai}</small>
                <b>{scores[category.id]} คำ</b>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (screen === "difficulty") {
    const category = categoryMeta.find((item) => item.id === selectedCategory)!;
    return (
      <main className="app-shell content-shell">
        <AppHeader progress={progress} onScores={() => setScreen("scores")} />
        <section className="panel selection-panel">
          <button className="text-button" type="button" onClick={() => setScreen("categories")}>
          <ArrowLeft size={18} weight="bold" aria-hidden="true" /> เปลี่ยนหมวด
          </button>
          <p className="eyebrow">{category.label}</p>
          <h2>เลือกระดับความท้าทาย</h2>
          <div className="difficulty-list">
            {difficultyMeta.map((difficulty) => (
              <button
                className={`difficulty-card ${difficulty.id}`}
                type="button"
                key={difficulty.id}
                onClick={() => startGame(difficulty.id)}
              >
                <span>
                  <strong>{difficulty.label}</strong>
                  <small>{difficulty.description}</small>
                </span>
                <b>{difficulty.time}</b>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (!game || !currentWord || !crossword) return null;

  const solvedSet = new Set(game.solvedWordIds);

  return (
    <main className={`game-shell theme-${game.level.category}`}>
      <header className="game-header">
        <button className="round-button" type="button" onClick={() => setScreen("difficulty")}>
          <ArrowLeft size={24} weight="bold" aria-hidden="true" />
          <span className="sr-only">กลับไปเลือกระดับ</span>
        </button>
        <div className={`timer ${secondsLeft <= 10 ? "urgent" : ""}`} aria-live="polite">
          {formatTime(secondsLeft)}
        </div>
        <button className="round-button" type="button" onClick={() => setScreen("scores")}>
          <Trophy size={22} weight="fill" aria-hidden="true" />
          <span className="score-number">{scores.total}</span>
          <span className="sr-only">คะแนนรวม</span>
        </button>
      </header>

      <section className="game-content" aria-label="กระดานคำศัพท์">
        <div className="level-heading">
          <span>{game.level.category}</span>
          <strong>{game.level.difficulty}</strong>
        </div>

        <div className="puzzle-viewport">
          <div
            className="puzzle-board"
            style={
              {
                "--puzzle-columns": crossword.columns,
                "--puzzle-rows": crossword.rows,
              } as CSSProperties
            }
          >
            {crossword.cells.map((cell) => {
              const revealed = cell.wordIds.some((wordId) => solvedSet.has(wordId));
              return (
                <span
                  className={`letter-cell ${revealed ? "solved" : ""}`}
                  style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
                  key={`${cell.row}-${cell.col}`}
                  aria-label={revealed ? cell.letter : "ช่องว่าง"}
                >
                  {revealed ? cell.letter : ""}
                </span>
              );
            })}
          </div>
        </div>

        {game.status === "playing" && (
          <section className="word-controls" aria-label="เรียงตัวอักษร">
            <p className="word-progress">
              คำที่ {game.activeWordIndex + 1} จาก {game.level.words.length} · {currentWord.word.length} ตัวอักษร
            </p>
            <div className="clue-card">
              <span>Meaning</span>
              <p>{currentWord.definition}</p>
            </div>
            <div className="answer-line" aria-live="polite">
              {answer || "แตะตัวอักษรเพื่อสร้างคำ"}
            </div>
            <div className="letter-wheel">
              {letterBank.map((letter, index) => (
                <button
                  type="button"
                  className="letter-button"
                  key={`${letter}-${index}`}
                  disabled={selectedLetters.includes(index)}
                  onClick={() => {
                    setFeedback("");
                    setSelectedLetters((current) => [...current, index]);
                  }}
                  style={
                    {
                      "--letter-index": index,
                      "--letter-count": letterBank.length,
                    } as CSSProperties
                  }
                >
                  {letter}
                </button>
              ))}
            </div>
            <p className={`feedback ${feedback.includes("ไม่ใช่") ? "error" : ""}`} aria-live="polite">
              {feedback}
            </p>
            <div className="game-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setSelectedLetters((current) => current.slice(0, -1))}
                disabled={selectedLetters.length === 0}
              >
                <Backspace size={20} weight="bold" aria-hidden="true" /> ลบตัวล่าสุด
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={submitCurrentWord}
                disabled={!answer}
              >
                <Check size={20} weight="bold" aria-hidden="true" /> ตรวจคำ
              </button>
            </div>
          </section>
        )}
      </section>

      {game.status === "complete" && (
        <div className="modal-backdrop" role="presentation">
          <section className="result-modal" role="dialog" aria-modal="true" aria-labelledby="success-title">
            <img
              className="result-mascot"
              src={`${import.meta.env.BASE_URL}wanderwords-mascot.png`}
              alt="มาสคอต WanderWords กำลังฉลอง"
            />
            <span className="result-badge">ผ่านด่าน</span>
            <h2 id="success-title">ยอดเยี่ยม {progress.playerName}!</h2>
            <p>คำศัพท์ที่เรียนรู้ในด่านนี้</p>
            <TranslationTable game={game} />
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setScreen("scores")}>
                ดูคะแนน
              </button>
              <button className="primary-button" type="button" onClick={() => setScreen("categories")}>
                เลือกด่านต่อไป
              </button>
            </div>
          </section>
        </div>
      )}

      {game.status === "timeout" && (
        <div className="modal-backdrop" role="presentation">
          <section className="result-modal" role="dialog" aria-modal="true" aria-labelledby="timeout-title">
            <span className="result-badge timeout">หมดเวลา</span>
            <h2 id="timeout-title">ใกล้แล้ว ลองอีกครั้งนะ</h2>
            <p>
              ตอบถูกแล้ว {game.solvedWordIds.length} จาก {game.level.words.length} คำ
            </p>
            <div className="solved-chips">
              {game.level.words
                .filter((word) => solvedSet.has(word.id))
                .map((word) => <span key={word.id}>{word.word}</span>)}
              {game.solvedWordIds.length === 0 && <small>ยังไม่มีคำที่ตอบถูกในรอบนี้</small>}
            </div>
            <button className="primary-button full-button" type="button" onClick={restartCurrentGame}>
              เริ่มด่านนี้ใหม่
            </button>
            <button className="secondary-button full-button" type="button" onClick={() => setShowAnswers(true)}>
              ดูเฉลยทั้งหมด
            </button>
          </section>
        </div>
      )}

      {showAnswers && (
        <div className="modal-backdrop answer-layer" role="presentation">
          <section className="result-modal" role="dialog" aria-modal="true" aria-labelledby="answers-title">
            <h2 id="answers-title">เฉลยทั้งหมด</h2>
            <p>เปิดอ่านได้ แต่ยังต้องเริ่มด่านนี้ใหม่เพื่อผ่านด่าน</p>
            <TranslationTable game={game} />
            <button className="secondary-button full-button" type="button" onClick={() => setShowAnswers(false)}>
              ปิดเฉลย
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

function TranslationTable({ game }: { game: Game }) {
  return (
    <div className="translation-table">
      <div className="translation-heading">
        <strong>English</strong>
        <strong>คำแปลไทย</strong>
      </div>
      {game.level.words.map((word) => (
        <div className="translation-row" key={word.id}>
          <span>{word.word}</span>
          <span>{word.thai}</span>
        </div>
      ))}
    </div>
  );
}

