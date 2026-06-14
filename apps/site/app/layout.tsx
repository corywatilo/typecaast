import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics, ConsentBanner } from "../lib/analytics";

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
    <html lang="en" data-tc-theme="dark" className={`tc ${inter.className}`}>
      <body>
        <Analytics />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
