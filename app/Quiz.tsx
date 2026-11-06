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
  const keyboardState = useRef({ answer, leaving, q, props });
  keyboardState.current = { answer, leaving, q, props };
  useEffect(
    () => () => {
      if (pending.current !== null) clearTimeout(pending.current);
    },
    [],
  );
  useEffect(() => {
    if (restoreFocus.current) first.current?.focus({ preventScroll: true });
  }, [q]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable]")) return;
      const state = keyboardState.current;
      if (state.leaving) return;
      if (state.answer !== null && event.key === "Enter") {
        event.preventDefault();
        next();
      } else if (state.answer === null && /^[1-4]$/.test(event.key)) {
        event.preventDefault();
        setAnswer(state.q.options[Number(event.key) - 1]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  function next() {
    if (pending.current !== null) return;
    const current = keyboardState.current;
    const upcoming = question(current.props, current.q.correct);
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
            <kbd className="key-hint" aria-hidden="true">{i + 1}</kbd>
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
              <kbd className="key-hint" aria-hidden="true">Enter</kbd>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
