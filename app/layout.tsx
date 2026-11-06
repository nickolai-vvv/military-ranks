import "./style.css";
export const metadata = {
  title: "RankAtlas — воинские звания и знаки различия",
  description:
    "Интерактивный справочник воинских званий России. Изучайте погоны сухопутных войск и проверяйте себя в коротком тренажёре.",
  keywords: [
    "воинские звания России",
    "погоны России",
    "знаки различия",
    "звания сухопутных войск",
    "тренажёр воинских званий",
    "RankAtlas",
  ],
  openGraph: {
    title: "RankAtlas — воинские звания России",
    description:
      "Узнайте воинское звание по знакам различия и проверьте свои знания.",
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
