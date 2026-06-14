/**
 * A representative captured chat thread (Slack-ish), with inline styles so the
 * distiller has something to slot-ify and tokenize under jsdom (which has no
 * cascade). Includes a hidden row and a `data-*` payload to prove pruning.
 */
export const SLACK_THREAD_HTML = `
<div class="thread" style="background: #ffffff; font-family: Lato, sans-serif; padding: 12px">
  <div class="thread-header" style="font-weight: 700; color: #1d1c1d">#alerts</div>
  <div class="message-list" style="display: flex; flex-direction: column; gap: 8px">
    <div class="msg" data-msg-id="1" style="display: flex; gap: 8px">
      <img class="avatar" src="https://example.test/cory.png" alt="Cory" style="border-radius: 4px">
      <div class="msg-body" style="display: flex; flex-direction: column">
        <span class="sender" style="font-weight: 700; color: #1d1c1d">Cory Watilo</span>
        <span class="timestamp" style="color: #616061; font-size: 12px">9:41</span>
        <div class="text" style="color: #1d1c1d">i got a billing toast error?</div>
      </div>
    </div>
    <div class="msg" data-msg-id="2" style="display: flex; gap: 8px">
      <img class="avatar" src="https://example.test/paul.png" alt="Paul" style="border-radius: 4px">
      <div class="msg-body" style="display: flex; flex-direction: column">
        <span class="sender" style="font-weight: 700; color: #1d1c1d">Paul D'Ambra</span>
        <span class="timestamp" style="color: #616061; font-size: 12px">9:42</span>
        <div class="text" style="color: #1d1c1d">shouldn't error</div>
      </div>
    </div>
    <div class="msg" data-msg-id="3" style="display: flex; gap: 8px">
      <img class="avatar" src="https://example.test/cory.png" alt="Cory" style="border-radius: 4px">
      <div class="msg-body" style="display: flex; flex-direction: column">
        <span class="sender" style="font-weight: 700; color: #1d1c1d">Cory Watilo</span>
        <span class="timestamp" style="color: #616061; font-size: 12px">9:43</span>
        <div class="text" style="color: #1d1c1d">let me check</div>
      </div>
    </div>
    <div class="msg hidden" aria-hidden="true" style="display: none">
      <div class="text">offscreen draft that must be dropped</div>
    </div>
  </div>
  <div class="composer" style="border: 1px solid #ddd; border-radius: 8px; padding: 8px">
    <div role="textbox" class="composer-input" contenteditable="true" style="color: #1d1c1d">Message #alerts</div>
  </div>
</div>`;
