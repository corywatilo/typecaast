import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics, ConsentBanner } from "../lib/analytics";
import { ThemeController } from "../components/ThemeController";

// Applied before paint to avoid a theme flash; mirrors lib/theme.ts.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('tc-site-theme')||'dark';var d=t==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.dataset.tcTheme=d;}catch(e){}})();`;

const inter = Inter({ subsets: ["latin"], display: "swap" });

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
      className={`tc ${inter.className}`}
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
