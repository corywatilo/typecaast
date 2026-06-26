import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics, ConsentBanner } from "../lib/analytics";
import { ThemeController } from "../components/ThemeController";

// Applied before paint to avoid a theme flash; mirrors lib/theme.ts.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('tc-site-theme')||'dark';var d=t==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.dataset.tcTheme=d;}catch(e){}})();`;

// RoundHog ships discrete static instances (not a variable font), so off-spec
// design weights (540–720) round to the nearest loaded weight. We expose it as a
// CSS variable that the site's --tc-font-sans token consumes (see globals.css).
const roundhog = localFont({
  src: [
    { path: "./fonts/RoundHog.woff2", weight: "400", style: "normal" },
    { path: "./fonts/RoundHog-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/RoundHog-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/RoundHog-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-roundhog",
});

export const metadata: Metadata = {
  title: "Typecaast — simulate & record chat conversations",
  description:
    "Simulate and record chat conversations in pixel-faithful renderings of real UIs — drop a <Typecaast> component on a page or export an MP4/GIF, all from one JSON config.",
  metadataBase: new URL("https://typecaast.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-tc-theme="dark"
      className={`tc ${roundhog.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <ThemeController />
        <Analytics />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
