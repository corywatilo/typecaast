import { SLACK_THREAD_HTML } from "./slack-thread.js";

/**
 * The capture quality-bar fixture set (PLAN §10, M5.8). Each is a realistic
 * chat layout that *does* contain all five core slots (avatar, author,
 * timestamp, body, composer), so detection accuracy is what's measured — not
 * whether a UI happens to omit a slot. The §10 bar: median slot-detection ≥0.8
 * across the set, with no manual hinting.
 */
export interface CaptureCase {
  name: string;
  selector: string;
  html: string;
}

const DISCORD = `
<div class="chat" style="background:#313338;color:#dbdee1;font-family:gg sans,sans-serif;padding:12px">
  <div class="chan" style="font-weight:700;color:#f2f3f5">#general</div>
  <div class="scroller" style="display:flex;flex-direction:column;gap:14px">
    <div class="message" style="display:flex;gap:12px">
      <img class="avatar" src="https://x.test/a.png" alt="" style="border-radius:50%;width:40px;height:40px">
      <div class="contents" style="display:flex;flex-direction:column">
        <div class="header"><span class="username" style="font-weight:600;color:#f2f3f5">cory</span><span class="timestamp" style="color:#949ba4;font-size:12px">Today at 9:41</span></div>
        <div class="messageContent" style="color:#dbdee1">deploy is green</div>
      </div>
    </div>
    <div class="message" style="display:flex;gap:12px">
      <img class="avatar" src="https://x.test/b.png" alt="" style="border-radius:50%;width:40px;height:40px">
      <div class="contents" style="display:flex;flex-direction:column">
        <div class="header"><span class="username" style="font-weight:600;color:#f2f3f5">paul</span><span class="timestamp" style="color:#949ba4;font-size:12px">Today at 9:42</span></div>
        <div class="messageContent" style="color:#dbdee1">shipping it</div>
      </div>
    </div>
  </div>
  <div class="composer" style="background:#383a40;border-radius:8px;padding:10px"><div role="textbox" contenteditable="true">Message #general</div></div>
</div>`;

const TEAMS = `
<div class="thread" style="background:#fff;color:#242424;font-family:Segoe UI,sans-serif;padding:16px">
  <div class="title" style="font-weight:600">Project Sync</div>
  <ul class="messageList" style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px">
    <li class="msgRow" style="display:flex;gap:10px">
      <div class="avatar" style="width:32px;height:32px;border-radius:50%;background:#6264a7;color:#fff">CW</div>
      <div class="msgMain" style="display:flex;flex-direction:column">
        <div class="meta"><span class="author" style="font-weight:600">Cory Watilo</span><span class="time" style="color:#616161;font-size:12px">10:02 AM</span></div>
        <div class="content" style="color:#242424">can you review the PR?</div>
      </div>
    </li>
    <li class="msgRow" style="display:flex;gap:10px">
      <div class="avatar" style="width:32px;height:32px;border-radius:50%;background:#0b6a0b;color:#fff">PD</div>
      <div class="msgMain" style="display:flex;flex-direction:column">
        <div class="meta"><span class="author" style="font-weight:600">Paul D</span><span class="time" style="color:#616161;font-size:12px">10:03 AM</span></div>
        <div class="content" style="color:#242424">on it now</div>
      </div>
    </li>
  </ul>
  <div class="composeBar" style="border:1px solid #d1d1d1;border-radius:6px;padding:8px"><div role="textbox" contenteditable="true">Type a message</div></div>
</div>`;

export const CAPTURE_CASES: CaptureCase[] = [
  { name: "slack", selector: ".thread", html: SLACK_THREAD_HTML },
  { name: "discord", selector: ".chat", html: DISCORD },
  { name: "teams", selector: ".thread", html: TEAMS },
];
