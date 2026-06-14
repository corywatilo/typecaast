"use client";

import { useEffect } from "react";
import { track } from "../lib/analytics";

export function DocsViewedTracker() {
  useEffect(() => {
    track("docs_viewed");
  }, []);
  return null;
}
