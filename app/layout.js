import "./globals.css";

export const metadata = {
  title: "Focus",
  description: "A personal focus workspace: sessions, tasks, music, and a little discipline.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Sets data-time-band before first paint, so the sunrise/day/sunset/
            night palette in globals.css is correct on load, no flash. Keep
            the hour bands identical to lib/timeBand.js. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h=new Date().getHours();var b=(h>=5&&h<8)?"dawn":(h>=8&&h<17)?"day":(h>=17&&h<20)?"dusk":"night";document.documentElement.setAttribute("data-time-band",b);})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
