import "./style.css";
export const metadata = {
  title: "Справочник воинских званий",
  description: "Выберите страну и изучайте воинские звания и знаки различия.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
