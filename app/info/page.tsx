import type { Metadata } from "next";
import catalog from "../../public/ranks/russia/army/catalog.json";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Конфиденциальность и источники изображений",
  description:
    "Сведения об обработке данных посетителей и источниках изображений.",
  alternates: { canonical: "/military-ranks/info/" },
};

export default function InfoPage() {
  return (
    <main className="info-page">
      <a href={basePath + "/"}>← На главную</a>
      <h1>Конфиденциальность и источники</h1>
      <h2>1. Использование данных</h2>
      <p>
        Сайт не предусматривает регистрацию и не запрашивает имя, адрес
        электронной почты или иные контактные данные посетителя. На сайте
        отсутствуют рекламные и аналитические скрипты. Файлы cookie приложением
        не устанавливаются. Ответы в тренажёре обрабатываются в браузере
        посетителя и не передаются владельцу сайта.
      </p>
      <h2>2. Хранение информации на устройстве</h2>
      <p>
        Сайт не сохраняет сведения о посетителе и его ответах в localStorage,
        sessionStorage или файлах cookie. Текст на главной странице выбирается
        случайным образом при каждой загрузке.
      </p>
      <h2>3. Размещение сайта и связь</h2>
      <p>
        Сайт размещён на GitHub Pages. При обращении к сайту GitHub может
        обрабатывать технические данные соединения в соответствии со своим{" "}
        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
          заявлением о конфиденциальности
        </a>
        . По вопросам использования сайта и изображений обратитесь к владельцу
        через{" "}
        <a href="https://github.com/nickolai-vvv">
          профиль <span style={{ whiteSpace: "nowrap" }}>N-VVV</span> на GitHub
        </a>.
      </p>
      <h2>4. Источники изображений</h2>
      <p>
        Изображения погон созданы Skjoldbro и опубликованы на Wikimedia Commons
        под{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">
          лицензией CC BY-SA 4.0
        </a>
        . Для сайта изображения преобразованы из SVG в WebP. Преобразованные
        изображения распространяются на условиях той же лицензии. Оригиналы:
      </p>
      <ul className="credit-list">
        {catalog.map(({ photo, rank }) => {
          const original = photo.replace(/\.webp$/, "");
          return (
            <li key={photo}>
              <a href={"https://commons.wikimedia.org/wiki/File:" + original}>
                {rank} — {original}
              </a>
            </li>
          );
        })}
      </ul>
      <p>
        Текстура Земли взята из{" "}
        <a href="https://github.com/vasturiano/three-globe/tree/master/example/img">
          набора изображений three-globe
        </a>
        . Изображения карточек войск созданы генератором изображений.
      </p>
    </main>
  );
}
