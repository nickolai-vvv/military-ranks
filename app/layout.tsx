import "./style.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://nickolai-vvv.github.io"),
  title: "Воинские звания России — тренажёр для изучения",
  description:
    "Учите воинские звания России по знакам различия. Смотрите изображение, выбирайте один из четырёх ответов и сразу проверяйте себя.",
  alternates: { canonical: "/military-ranks/" },

  keywords: [
    "воинские звания",
    "изучение воинских званий",
    "воинские звания России",
    "воинские звания стран мира",
    "погоны",
    "погоны России",
    "погоны и звания",
    "знаки различия",
    "армейские звания",
    "военно-морские звания",
    "звания сухопутных войск",
    "звания ВМФ",
    "звания армии России",
    "таблица воинских званий",
    "определить воинское звание",
    "определить звание по погонам",
    "тест на знание воинских званий",
    "тренажёр воинских званий",
  ],

  openGraph: {
    title: "Воинские звания России — тренажёр для изучения",
    description:
      "Учите воинские звания России по знакам различия в интерактивном тренажёре.",
    url: "https://nickolai-vvv.github.io/military-ranks/",
    locale: "ru_RU",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
