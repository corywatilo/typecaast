"use client";

import { useEffect } from "react";
import { applySiteTheme, cycleSiteTheme, getSiteTheme } from "../lib/theme";

/**
 * Applies the saved theme on mount, keeps "auto" in sync with the OS, and binds
 * the global `m` shortcut to cycle auto → light → dark. Mounted in the root
 * layout so the shortcut works on every page (including the playground), but it
 * never fires while typing in an input/textarea/select/contenteditable. No UI —
 * the visible control is the footer `ThemeToggle`.
 */

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.tagName) return false;
  const tag = node.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    node.isContentEditable === true
  );
}

export function ThemeController() {
  useEffect(() => {
    applySiteTheme(getSiteTheme());

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "m" && e.key !== "M") return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      cycleSiteTheme();
    };

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (getSiteTheme() === "auto") applySiteTheme("auto");
    };

    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onSystem);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onSystem);
    };
  }, []);

  return null;
}
