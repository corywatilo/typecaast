"use client";

import dynamic from "next/dynamic";

// CodeMirror + the slot-template renderer need the browser DOM, so we
// dynamic-import the editor with SSR off. `next/dynamic`'s `ssr: false`
// flag is only allowed inside a Client Component, hence this thin wrapper.
const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--tc-text-muted)",
        fontSize: 13,
      }}
    >
      Loading editor…
    </div>
  ),
});

export function EditorMount() {
  return <Editor />;
}
