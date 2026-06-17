import { toContentNodes, type Participant } from "@typecaast/schema";
import type {
  RenderedMessage,
  RenderedReaction,
  ResolvedTheme,
  SimState,
} from "../sim-state.js";
import type { GetStateAt } from "../player.js";

/**
 * A hand-authored, faked playback of the spec's Slack billing-toast thread —
 * **no engine**. It exists so the UI (skins, player, builder) can be built and
 * validated against the locked `SimState` contract before `compile`/
 * `getStateAt` exist (UI-first, PLAN §14). Building it by hand is also how we
 * pressure-test what the real engine + schema must produce.
 *
 * `buildMockBillingToastState(t)` is a pure function of time — same `t` always
 * yields a deep-equal state — so it stands in for the engine's determinism too.
 */

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** ms a message takes to reveal (fade/slide-in) once it appears. */
const REVEAL_MS = 280;
/** ms a reaction takes to pop in. */
const REACTION_MS = 200;

export const mockParticipants: Participant[] = [
  { id: "cory", name: "Cory Watilo", isSelf: true, kind: "person" },
  { id: "paul", name: "Paul D'Ambra", color: "#5b3a8e", kind: "person" },
  { id: "posthog-bot", name: "PostHog", kind: "app" },
];

const COMPOSER_TEXT =
  "Let me check how exceptions are captured in the frontend.";

interface MockMessageEvent {
  kind: "message" | "system";
  id: string;
  from: string;
  start: number;
  content: ReturnType<typeof toContentNodes>;
  card?: string;
  actions?: {
    label: string;
    href?: string;
    variant?: "primary" | "secondary";
  }[];
}

interface MockReactionEvent {
  target: string;
  emoji: string;
  by: string[];
  start: number;
}

interface MockTypingEvent {
  from: string;
  start: number;
  end: number;
}

interface MockComposerEvent {
  from: string;
  text: string;
  start: number;
  end: number;
}

const messageEvents: MockMessageEvent[] = [
  {
    kind: "message",
    id: "m1",
    from: "cory",
    start: 600,
    content: toContentNodes({
      text: "i got a billing toast error on the dashboard but i think it's a bug?",
    }),
  },
  {
    kind: "message",
    id: "m2",
    from: "paul",
    start: 4300,
    content: toContentNodes({
      text: "@PostHog the billing/spend API call shouldn't show an error toast to the user…",
    }),
  },
  {
    kind: "message",
    id: "m3",
    from: "cory",
    start: 6000,
    content: toContentNodes({
      text: "here's the toast:",
      images: [{ src: "./toast.png", alt: "billing error toast", width: 320 }],
    }),
  },
  {
    kind: "system",
    id: "s1",
    from: "posthog-bot",
    start: 7500,
    content: toContentNodes({ text: "Pull request opened." }),
    card: "pr-opened",
    actions: [{ label: "View PR" }, { label: "Open in PostHog Code" }],
  },
  {
    kind: "message",
    id: "m4",
    from: "cory",
    start: 11200,
    content: toContentNodes({ text: COMPOSER_TEXT }),
  },
];

const reactionEvents: MockReactionEvent[] = [
  { target: "m1", emoji: "🦔", by: ["paul"], start: 2000 },
];

const typingEvents: MockTypingEvent[] = [
  { from: "paul", start: 2600, end: 4300 },
];

const composerEvents: MockComposerEvent[] = [
  { from: "cory", text: COMPOSER_TEXT, start: 8500, end: 11000 },
];

/** Total faked timeline length. */
export const MOCK_BILLING_TOAST_DURATION_MS = 12000;

/** Step boundaries (event start times) for stepNext/stepPrev in the player. */
export const MOCK_BILLING_TOAST_STEPS: number[] = [
  0,
  ...messageEvents.map((e) => e.start),
  ...reactionEvents.map((e) => e.start),
  ...typingEvents.map((e) => e.start),
  ...composerEvents.map((e) => e.start),
  MOCK_BILLING_TOAST_DURATION_MS,
]
  .sort((a, b) => a - b)
  .filter((t, i, arr) => arr.indexOf(t) === i);

function reactionsFor(targetId: string, t: number): RenderedReaction[] {
  return reactionEvents
    .filter((r) => r.target === targetId && r.start <= t)
    .map((r) => ({
      emoji: r.emoji,
      count: r.by.length,
      by: r.by,
      byNames: r.by,
      progress: clamp01((t - r.start) / REACTION_MS),
    }));
}

/** Build the complete faked state at time `t` (pure). */
export function buildMockBillingToastState(
  t: number,
  theme: ResolvedTheme = "light",
): SimState {
  // Composer: typing in progress until a send commits the message.
  const composerEvent = composerEvents[0];
  const sendEvent = messageEvents.find((e) => e.id === "m4");
  let composerText = "";
  let composerCaret = 0;
  let sending = false;
  let composerFrom: string | undefined;
  if (composerEvent && sendEvent && t < sendEvent.start) {
    if (t >= composerEvent.start) {
      composerFrom = composerEvent.from;
      const frac = clamp01(
        (t - composerEvent.start) / (composerEvent.end - composerEvent.start),
      );
      const chars = Math.round(frac * composerEvent.text.length);
      composerText = composerEvent.text.slice(0, chars);
      composerCaret = composerText.length;
      sending = t >= composerEvent.end;
    }
  }

  const visible = messageEvents.filter((e) => e.start <= t);
  const messages: RenderedMessage[] = visible.map((e, i) => {
    const previous = visible[i - 1];
    return {
      id: e.id,
      from: e.from,
      variant: e.kind,
      content: e.content,
      revealProgress: clamp01((t - e.start) / REVEAL_MS),
      state: "sent",
      reactions: reactionsFor(e.id, t),
      isSelf: e.from === "cory",
      isGrouped: previous !== undefined && previous.from === e.from,
      atMs: e.start,
      ...(e.kind === "system"
        ? { system: { card: e.card, actions: e.actions } }
        : {}),
    };
  });

  const typingIndicators = typingEvents
    .filter((e) => t >= e.start && t < e.end)
    .map((e) => ({
      from: e.from,
      progress: clamp01((t - e.start) / (e.end - e.start)),
    }));

  // Scroll: target grows with the thread; flag a reason when something landed recently.
  const lastAppear = Math.max(0, ...visible.map((e) => e.start));
  const recentReaction = reactionEvents.some(
    (r) => r.start <= t && t - r.start < 300,
  );
  const scroll = {
    targetOffset: messages.length * 64,
    reason: (t - lastAppear < 300 && messages.length > 0
      ? "new-message"
      : recentReaction
        ? "reaction"
        : "none") as SimState["scroll"]["reason"],
  };

  return {
    messages,
    typingIndicators,
    composer: {
      from: composerFrom,
      text: composerText,
      caret: composerCaret,
      sending,
    },
    scroll,
    durationMs: MOCK_BILLING_TOAST_DURATION_MS,
    theme,
  };
}

/** A `GetStateAt` over the faked billing-toast thread, fixed to one theme. */
export function createMockBillingToastGetStateAt(
  theme: ResolvedTheme = "light",
): GetStateAt {
  return (t: number) => buildMockBillingToastState(t, theme);
}

/** Hand-picked snapshots at representative moments (for stories/tests). */
export const mockBillingToastSnapshots = {
  empty: buildMockBillingToastState(0),
  firstMessage: buildMockBillingToastState(900),
  paulTyping: buildMockBillingToastState(3000),
  withSystemCard: buildMockBillingToastState(7800),
  composerTyping: buildMockBillingToastState(9800),
  complete: buildMockBillingToastState(MOCK_BILLING_TOAST_DURATION_MS),
} satisfies Record<string, SimState>;
