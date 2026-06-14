import { LAST_DRAFT_KEY, type ExtMessage } from "./messages.js";

/**
 * Service worker: persists the last capture to `chrome.storage.local` and saves
 * the draft to disk via the downloads API. Nothing leaves the machine — there
 * is no host permission and no fetch (PLAN §10/§18).
 */
chrome.runtime.onMessage.addListener((msg: ExtMessage) => {
  if (msg.type !== "tc-capture") return;
  void chrome.storage.local.set({
    [LAST_DRAFT_KEY]: { draft: msg.draft, json: msg.json, at: Date.now() },
  });
  const url = `data:application/json;charset=utf-8,${encodeURIComponent(msg.json)}`;
  void chrome.downloads.download({ url, filename: msg.filename, saveAs: true });
});
