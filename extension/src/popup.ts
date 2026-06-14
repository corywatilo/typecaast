import { LAST_DRAFT_KEY, type ExtMessage } from "./messages.js";

/** Popup UI: start the picker on the active tab, surface the last capture. */

const statusEl = document.getElementById("status") as HTMLParagraphElement;
const pickBtn = document.getElementById("pick") as HTMLButtonElement;
const dlBtn = document.getElementById("download") as HTMLButtonElement;

function setStatus(text: string): void {
  statusEl.textContent = text;
}

async function refreshLast(): Promise<void> {
  const store = await chrome.storage.local.get(LAST_DRAFT_KEY);
  const last = store[LAST_DRAFT_KEY] as
    | { draft: { meta: { name: string } }; json: string }
    | undefined;
  if (last) {
    dlBtn.disabled = false;
    dlBtn.dataset.json = last.json;
    dlBtn.dataset.name = last.draft.meta.name;
  } else {
    dlBtn.disabled = true;
  }
}

pickBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus("No active tab.");
    return;
  }
  setStatus("Pick an element on the page…");
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["picker.js"],
  });
  window.close();
});

dlBtn.addEventListener("click", () => {
  const json = dlBtn.dataset.json;
  if (!json) return;
  const url = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
  void chrome.downloads.download({
    url,
    filename: `${(dlBtn.dataset.name ?? "skin")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-draft.json`,
    saveAs: true,
  });
});

chrome.runtime.onMessage.addListener((msg: ExtMessage) => {
  if (msg.type === "tc-picked") {
    setStatus(msg.summary ?? (msg.ok ? "Captured." : "Nothing captured."));
    void refreshLast();
  }
});

void refreshLast();
