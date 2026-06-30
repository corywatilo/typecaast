// The authoring guides, inlined as strings at build time (esbuild `text`
// loader). Source of truth is the repo's /docs — these are the same files the
// site serves. Kept out of core.ts so the unit tests don't need a .md loader.
import authoringConfigs from "../../../docs/authoring-configs.md";
import pacing from "../../../docs/pacing.md";
import messageContent from "../../../docs/message-content.md";

export interface DocEntry {
  slug: string;
  title: string;
  text: string;
}

export const DOCS: DocEntry[] = [
  {
    slug: "authoring-configs",
    title: "Authoring configs by hand",
    text: authoringConfigs,
  },
  { slug: "pacing", title: "Pacing & timing", text: pacing },
  {
    slug: "message-content",
    title: "Message content",
    text: messageContent,
  },
];
