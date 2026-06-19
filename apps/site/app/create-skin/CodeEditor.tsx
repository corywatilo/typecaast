"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";

type Language = "html" | "css" | "json";

export interface CodeEditorProps {
  value: string;
  language: Language;
  onChange: (next: string) => void;
}

function extForLanguage(lang: Language) {
  switch (lang) {
    case "html":
      return html();
    case "css":
      return css();
    case "json":
      return json();
  }
}

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // Hold the latest `onChange` so we don't have to rebuild the view on every
  // parent render (CodeMirror is expensive to instantiate).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hostRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        oneDark,
        extForLanguage(language),
        keymap.of([]),
        EditorView.lineWrapping,
        EditorView.theme({
          "&": { height: "100%", fontSize: "12.5px" },
          ".cm-scroller": { fontFamily: "Menlo, Monaco, monospace" },
        }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChangeRef.current(u.state.doc.toString());
        }),
      ],
    });
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Recreate the view when the language changes (different parser).
    // `value` is handled by the separate effect below, not here.
  }, [language]);

  // Push external value changes (e.g. "load draft" button) into the editor
  // without losing the user's cursor mid-typing.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  return <div ref={hostRef} style={{ height: "100%", overflow: "hidden" }} />;
}
