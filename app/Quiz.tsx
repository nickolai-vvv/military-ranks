"use client";
import { useEffect, useRef, useState } from "react";
export type Rank = { photo: string; rank: string };
type QuizProps = { catalog: readonly Rank[]; photoDirectory: string };
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function shuffled<T>(items: readonly T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function question(
  { catalog, photoDirectory }: QuizProps,
  previousRank?: string,
) {
  const rankNames = [...new Set(catalog.map((entry) => entry.rank))];
  const candidates = catalog.filter((entry) => entry.rank !== previousRank);
  const entry = candidates[Math.floor(Math.random() * candidates.length)];
  const alternatives = shuffled(
    rankNames.filter((rank) => rank !== entry.rank),
  ).slice(0, 3);
  return {
    photo: basePath + photoDirectory + entry.photo,
    correct: entry.rank,
    options: shuffled([entry.rank, ...alternatives]),
  };
}
export default function Quiz(props: QuizProps) {
  const [q, setQ] = useState(() => question(props));
  const [answer, setAnswer] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useEffect(
    () => () => {
      if (pending.current !== null) clearTimeout(pending.current);
    },
    [],
  );
  useEffect(() => {
    if (restoreFocus.current) first.current?.focus({ preventScroll: true });
  }, [q]);
  function next() {
    if (pending.current !== null) return;
    const upcoming = question(props, q.correct);
    const preload = new Image();
    preload.src = upcoming.photo;
    setLeaving(true);
    pending.current = setTimeout(
      () => {
        pending.current = null;
        restoreFocus.current = true;
        setQ(upcoming);
        setAnswer(null);
        setLeaving(false);
      },
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 100,
    );
  }
  return (
    <div className="quiz" data-changing={leaving}>
      <div className="quizart">
        <img src={q.photo} alt="Погон для определения звания" />
      </div>
      <div className="options">
        {q.options.map((name, i) => (
          <button
            key={i}
            ref={i === 0 ? first : null}
            disabled={answer !== null}
            onClick={() => setAnswer(name)}
            className={
              answer !== null && name === q.correct
                ? "correct"
                : answer === name
                  ? "wrong"
                  : ""
            }
          >
            <span>{name}</span>
          </button>
        ))}
      </div>
      <div className="result">
        {answer !== null && (
          <>
            <span className="sr" role="status">
              {answer === q.correct ? "Верно" : "Верный вариант: " + q.correct}
            </span>
            <button disabled={leaving} onClick={next}>
              Продолжить
            </button>
          </>
        )}
      </div>
    </div>
  );
}
