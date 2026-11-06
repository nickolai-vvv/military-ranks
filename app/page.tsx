"use client";
import { useState, useRef, useEffect } from "react";
import Globe from "./Globe";
import Quiz from "./Quiz";

import army from "../public/ranks/russia/army/catalog.json";
import navy from "../public/ranks/russia/navy/catalog.json";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => basePath + path;

const introPhrases = [
  "Насколько хорошо вы знаете воинские звания?",
  "Сможете отличить лейтенанта от капитана?",
  "Проверьте свои знания воинских званий.",
  "Узнаете звание с первого взгляда?",
  "От рядового до генерала. Знаете все звания?",
];

type Branch = "army" | "navy";
type Screen = "world" | "branches" | Branch;
const catalogs = {
  army: { catalog: army, photoDirectory: "/ranks/russia/army/" },
  navy: { catalog: navy, photoDirectory: "/ranks/russia/navy/" },
};
const branches: { id: Branch; title: string }[] = [
  { id: "army", title: "Сухопутные войска" },
  { id: "navy", title: "Военно-морской флот" },
];
const previous: Record<Exclude<Screen, "world">, Screen> = {
  branches: "world",
  army: "branches",
  navy: "branches",
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("world"),
    [leaving, setLeaving] = useState<Screen | null>(null);
  const [introIndex, setIntroIndex] = useState(0);
  const introSelected = useRef(false);
  useEffect(() => {
    if (introSelected.current) return;
    introSelected.current = true;
    let index = Math.floor(Math.random() * introPhrases.length);
    try {
      const key = "introPhraseIndex";
      const stored = sessionStorage.getItem(key);
      if (stored !== null && Number.isInteger(Number(stored)) && Number(stored) >= 0) {
        index = (Number(stored) + 1) % introPhrases.length;
      }
      sessionStorage.setItem(key, String(index));
    } catch {
      // When tab storage is unavailable, keep the random starting phrase.
    }
    setIntroIndex(index);
  }, []);
  const heading = useRef<HTMLHeadingElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [screen]);
  function go(target: Screen) {
    if (timer.current || target === screen) return;
    setLeaving(target);
    timer.current = setTimeout(
      () => {
        timer.current = null;
        setScreen(target);
        setLeaving(null);
        window.scrollTo(0, 0);
      },
      matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : screen === "world"
          ? 820
          : 400,
    );
  }
  const section =
    screen === "army" || screen === "navy" ? catalogs[screen] : null;
  const ready =
    section && new Set(section.catalog.map((entry) => entry.rank)).size >= 4;
  const index = screen === "world" ? 1 : screen === "branches" ? 2 : 3;
  return (
    <div className={"shell " + (screen === "world" ? "map" : "inner")}>
      <header>
        <a
          className="author"
          href="https://github.com/nickolai-vvv"
          aria-label="N-VVV на GitHub"
        >
          N-VVV
        </a>
        <span className="descriptor">СПРАВОЧНИК ВОИНСКИХ ЗВАНИЙ</span>
      </header>
      <main key={screen} className={leaving ? "leaving" : ""}>
        {screen === "world" ? (
          <div className="world">
            <Globe active={!!leaving} onSelect={() => go("branches")} />
            <div className="intro">
              <h1 tabIndex={-1} ref={heading}>
                Выбор <br />
                страны
              </h1>
              <p>{introPhrases[introIndex]}</p>
            </div>
          </div>
        ) : (
          <div className="content">
            <button className="back" onClick={() => go(previous[screen])}>
              ←　 Назад
            </button>
            {screen === "branches" ? (
              <>
                <h1 ref={heading} tabIndex={-1} className="country-title">
                  <span aria-hidden="true" className="flag" />
                  Россия
                </h1>
                <div className="branches">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      className={
                        "branch " + (leaving === branch.id ? "selected" : "")
                      }
                      onClick={() => go(branch.id)}
                    >
                      <img alt="" src={asset("/atlas/" + branch.id + ".webp")} />
                      <div className="caption">
                        <h2>{branch.title}</h2>
                        <span className="select">Выбрать　→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : ready ? (
              <>
                <h1 className="sr" tabIndex={-1} ref={heading}>
                  Тренировка
                </h1>
                <Quiz {...section} />
              </>
            ) : (
              <>
                <div className="eyebrow">РОССИЯ</div>
                <h1 ref={heading} tabIndex={-1}>
                  {screen === "navy" ? "Корабельные звания" : "Воинские звания"}
                </h1>
                <p>Раздел в разработке.</p>
              </>
            )}
          </div>
        )}
      </main>
      <footer>
        <nav className="steps" aria-label="Этапы тренировки">
          {(["world", "branches", screen] as const).map((target, i) => (
            <button
              key={i}
              type="button"
              disabled={i + 1 >= index || !!leaving}
              onClick={() => go(target)}
              aria-label={["Выбор страны", "Выбор войск", "Раздел званий"][i]}
              aria-current={i + 1 === index ? "step" : undefined}
            />
          ))}
        </nav>
        <a className="site-info" href={basePath + "/info.html"}>
          Источники и данные
        </a>
      </footer>
    </div>
  );
}
