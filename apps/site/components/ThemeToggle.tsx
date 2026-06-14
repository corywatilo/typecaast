"use client";

import { useEffect, useState } from "react";
import { Kbd, Segmented } from "@typecaast/ui";
import {
  getSiteTheme,
  setSiteTheme,
  THEME_EVENT,
  type SiteTheme,
} from "../lib/theme";

/**
 * The visible theme control (auto / light / dark). Stays in sync with the
 * store, so the `m` shortcut and the segmented buttons reflect each other.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<SiteTheme>("dark");

  useEffect(() => {
    setTheme(getSiteTheme());
    const sync = () => setTheme(getSiteTheme());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Segmented<SiteTheme>
        aria-label="Color theme"
        value={theme}
        onChange={setSiteTheme}
        options={[
          { value: "auto", label: "Auto" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
      />
      <span
        className="tc-muted"
        style={{
          fontSize: 12,
          display: "inline-flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        <Kbd>M</Kbd> to switch
      </span>
    </div>
  );
}
