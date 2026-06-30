# Pacing & timing

Typecaast **auto-paces** a conversation so you don't have to time every step by
hand: it derives the gap before each message from how long the previous message
takes to "read", and how long typing takes from the text length. This is why a
config with no timing fields still plays at a human rhythm.

It's also the #1 source of "why is this too fast / why are my messages bunched
up?" — including the common ask, **"I want ~1–2s between messages."** This guide
explains the model and the levers. (For the full step reference, see
[authoring-configs.md](./authoring-configs.md).)

## The model

Timing is controlled by the optional top-level `pacing` object. Omit it and you
get the full default model:

```json
"pacing": {
  "readingWpm": 240,
  "typingCps": 14,
  "humanize": 0.15,
  "startDelayMs": 400
}
```

| Field          | Default | Unit      | What it controls                                                                |
| -------------- | ------- | --------- | ------------------------------------------------------------------------------- |
| `readingWpm`   | `240`   | words/min | The gap **before an incoming message** ≈ the time to read the **previous** one. |
| `typingCps`    | `14`    | chars/sec | Composer typing speed, and how long a typing indicator shows before a message.  |
| `humanize`     | `0.15`  | fraction  | ±15% **seeded** jitter on computed gaps/durations so it doesn't feel robotic.   |
| `startDelayMs` | `400`   | ms        | Delay before the very first event.                                              |

Every value is overridable per step in the timeline; per-step values win over the
computed ones.

### How the gap is computed

The key thing to understand: **the gap before a message scales with the length of
the _previous_ message**, because it models the other person reading it before
replying. Roughly:

```
words   ≈ characters / 5
gap(ms) ≈ (words / readingWpm) × 60000     (then ±humanize jitter)
```

So at the default 240 wpm:

- A short line like `"ship it?"` (~1.6 words) → gap ≈ **400ms**.
- A sentence of ~40 characters (~8 words) → gap ≈ **2000ms**.

**This is the gotcha:** with short messages, the default gaps are short (a few
hundred ms), so the conversation feels snappy/bunched. Lowering `readingWpm` or
adding explicit `delay` steps is how you stretch it out.

### Other automatic durations

- Typing indicator before a message (`message.typing: true`) lasts about as long
  as it would take to type that message at `typingCps`. A standalone `typing`
  step with no `showTypingFor` defaults to ~1500ms.
- A `reaction` with no `delay` lands ~1000ms after its target appears.
- `instant: true` on a step skips the reveal animation **and** the computed gap.

### Determinism

All jitter is seeded from `meta.seed` (default `42`). The same `(config, seed)`
always produces identical timings — there is no `Math.random()`. Change `seed`
to get a different (but still repeatable) jitter pattern.

## "I want ~1–2 seconds between messages"

Four ways, most predictable first.

### 1. Insert a `delay` step (recommended — exact and explicit)

A `delay` step is a fixed pause whose `duration` is in **milliseconds**:

```json
"timeline": [
  { "type": "message", "from": "sam", "text": "ship it?" },
  { "type": "delay", "duration": 1500 },
  { "type": "message", "from": "me", "text": "shipping 🚀" }
]
```

That guarantees ~1.5s between those two messages regardless of their length. Use
it between each pair of messages you want spaced out. It's the most reliable knob
because it doesn't depend on text length.

> **Don't confuse the two `delay`s.** The `delay` **step type** (`{ "type":
"delay", "duration": … }`) is a standalone pause. A `reaction` step also has a
> `delay` **field** — that one is the gap before the _reaction_ lands on its
> target. Different things.

### 2. Lower `readingWpm` globally

Slowing the "reading speed" lengthens every auto-computed gap at once:

```json
"pacing": { "readingWpm": 80 }
```

At ~80 wpm a short `"ship it?"` reply gaps ~1.2s; longer messages gap
proportionally more. Good for a uniformly slower feel. **Caveat:** because the
gap still scales with text length, very short messages stay shorter than very
long ones — if you need a precise gap, use a `delay` step (#1).

Rough guide for a short one-liner: ~120 wpm ≈ 0.8s, ~80 wpm ≈ 1.2s, ~60 wpm ≈
1.6s.

### 3. `instant` + `delay` for full manual control

Drop the automatic gaps entirely and place every pause yourself:

```json
{ "type": "message", "from": "sam", "text": "ship it?", "instant": true },
{ "type": "delay", "duration": 1200 },
{ "type": "message", "from": "me", "text": "shipping 🚀", "instant": true }
```

`instant` removes a step's computed gap and reveal animation, so the only spacing
is your `delay` steps. Use this when you want a precisely choreographed timeline.

### 4. Pad with a typing indicator

A typing indicator before a message both adds time and reads naturally:

```json
{ "type": "typing", "from": "sam", "showTypingFor": 1500 },
{ "type": "message", "from": "sam", "text": "shipping 🚀" }
```

or inline on the message:

```json
{
  "type": "message",
  "from": "sam",
  "text": "shipping 🚀",
  "typing": { "showTypingFor": 1500 }
}
```

`showTypingFor` is in **milliseconds**.

## Worked example

Two short messages with a deliberate 1.5s gap:

```json
{
  "$schema": "https://typecaast.com/schema/v1/typecaast.schema.json",
  "version": 1,
  "meta": {
    "canvas": { "width": 600, "height": 400 },
    "skin": { "id": "imessage" }
  },
  "participants": [
    { "id": "me", "name": "You", "isSelf": true },
    { "id": "sam", "name": "Sam" }
  ],
  "timeline": [
    { "type": "message", "from": "sam", "text": "ship it?" },
    { "type": "delay", "duration": 1500 },
    { "type": "message", "from": "me", "text": "shipping 🚀" }
  ]
}
```

Timeline: first message reveals at ~`startDelayMs` (400ms); the `delay` holds
1500ms; the reply reveals ~1.5s later. Without the `delay`, that gap would be the
default ~400ms reading time of `"ship it?"`.

## See also

- [authoring-configs.md](./authoring-configs.md) — the full config + step reference.
- [message-content.md](./message-content.md) — message bodies (mrkdwn + Block Kit).
  </content>
