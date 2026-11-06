import type { Metadata } from "next";
import catalog from "../../public/ranks/russia/army/catalog.json";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Источники изображений и данные сайта",
  description: "Сведения об изображениях знаков различия и хранении данных на сайте.",
};

export default function InfoPage() {
  return (
    <main className="info-page">
      <a href={basePath + "/"}>← На главную</a>
      <h1>Источники и данные</h1>
      <h2>Данные посетителя</h2>
      <p>
        Тренажёр не запрашивает имя, адрес электронной почты и регистрацию.
        В приложении нет аналитики, рекламы и файлов cookie. В пределах вкладки
        браузера сохраняется только номер фразы на главной странице, чтобы она
        менялась при обновлении. Этот номер удаляется при закрытии вкладки.
        Ответы в тренировке обрабатываются на устройстве и не отправляются на
        сервер.
      </p>
      <p>
        Сайт размещён на GitHub Pages. Обработка технических данных при
        обращении к хостингу описана в{" "}
        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
          заявлении GitHub о конфиденциальности
        </a>
        . По вопросам сайта можно связаться с автором через{" "}
        <a href="https://github.com/nickolai-vvv">профиль GitHub</a>.
      </p>
      <h2>Изображения</h2>
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
              <a
                href={"https://commons.wikimedia.org/wiki/File:" + original}
              >
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
