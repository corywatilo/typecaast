import type { ConfigInput } from "@typecaast/schema";

type Timeline = NonNullable<ConfigInput["timeline"]>;
type Step = Timeline[number];
type Participants = ConfigInput["participants"];
type Participant = Participants[number];
type Meta = ConfigInput["meta"];

/** Immutable config edits used by the builder. All return a new config. */

export function updateMeta(
  config: ConfigInput,
  patch: Partial<Meta>,
): ConfigInput {
  return { ...config, meta: { ...config.meta, ...patch } };
}

export function setSkin(
  config: ConfigInput,
  id: string,
  options?: Record<string, unknown>,
): ConfigInput {
  return updateMeta(config, {
    skin: { id, ...(options ? { options } : {}) },
  });
}

type Pacing = NonNullable<ConfigInput["pacing"]>;

export function updatePacing(
  config: ConfigInput,
  patch: Partial<Pacing>,
): ConfigInput {
  return { ...config, pacing: { ...(config.pacing ?? {}), ...patch } };
}

export function setCanvas(
  config: ConfigInput,
  width: number,
  height: number,
): ConfigInput {
  return updateMeta(config, { canvas: { width, height } });
}

export function addStep(
  config: ConfigInput,
  step: Step,
  atIndex?: number,
): ConfigInput {
  const timeline = [...config.timeline];
  const i = atIndex ?? timeline.length;
  timeline.splice(i, 0, step);
  return { ...config, timeline };
}

/**
 * Add a step with an auto-prepended `delay` so consecutive steps get a default
 * beat between them — without forcing the author to add it manually every time.
 * Skip the auto-delay when:
 *  - the timeline is empty (nothing to space from),
 *  - the new step is itself a `delay` (no double-pause),
 *  - the prior step is already a `delay` (idem),
 *  - or we're inserting at the very start (no prior step to space from).
 *
 * Returns the new config and the index the **new** step ended up at, so the
 * caller can keep its selection pointing at the right row.
 */
export function addStepAutoPaced(
  config: ConfigInput,
  step: Step,
  atIndex: number | undefined,
  autoDelayMs = 1000,
): { config: ConfigInput; index: number } {
  const at = atIndex ?? config.timeline.length;
  const prior = at > 0 ? config.timeline[at - 1] : undefined;
  const shouldAutoDelay =
    config.timeline.length > 0 &&
    at > 0 &&
    step.type !== "delay" &&
    prior?.type !== "delay";
  if (!shouldAutoDelay) {
    return { config: addStep(config, step, atIndex), index: at };
  }
  const delayStep: Step = { type: "delay", duration: autoDelayMs };
  const withDelay = addStep(config, delayStep, at);
  return { config: addStep(withDelay, step, at + 1), index: at + 1 };
}

export function updateStep(
  config: ConfigInput,
  index: number,
  patch: Partial<Step>,
): ConfigInput {
  const timeline = config.timeline.map((s, i) =>
    i === index ? ({ ...s, ...patch } as Step) : s,
  );
  return { ...config, timeline };
}

export function deleteStep(config: ConfigInput, index: number): ConfigInput {
  return { ...config, timeline: config.timeline.filter((_, i) => i !== index) };
}

export function duplicateStep(config: ConfigInput, index: number): ConfigInput {
  const step = config.timeline[index];
  if (!step) return config;
  // Drop the id so the copy gets a fresh auto id — duplicate ids collide in
  // the renderer (React keys) and break reaction/edit targeting.
  const { id: _id, ...rest } = step as { id?: string } & Record<
    string,
    unknown
  >;
  void _id;
  return addStep(config, rest as unknown as Step, index + 1);
}

export function moveStep(
  config: ConfigInput,
  from: number,
  to: number,
): ConfigInput {
  const timeline = [...config.timeline];
  if (from < 0 || from >= timeline.length || to < 0 || to >= timeline.length) {
    return config;
  }
  const [moved] = timeline.splice(from, 1);
  timeline.splice(to, 0, moved!);
  return { ...config, timeline };
}

export function addParticipant(
  config: ConfigInput,
  participant: Participant,
): ConfigInput {
  return { ...config, participants: [...config.participants, participant] };
}

export function updateParticipant(
  config: ConfigInput,
  index: number,
  patch: Partial<Participant>,
): ConfigInput {
  const participants = config.participants.map((p, i) =>
    i === index ? { ...p, ...patch } : p,
  );
  return { ...config, participants };
}

export function removeParticipant(
  config: ConfigInput,
  index: number,
): ConfigInput {
  return {
    ...config,
    participants: config.participants.filter((_, i) => i !== index),
  };
}

/** Mark one participant as the viewer (`isSelf`), clearing it on all others. */
export function setSelf(config: ConfigInput, index: number): ConfigInput {
  return {
    ...config,
    participants: config.participants.map((p, i) => ({
      ...p,
      isSelf: i === index ? true : undefined,
    })),
  };
}

/**
 * A blank step of a given type, for the "add step" menu. Textual fields are
 * left empty so the editor shows a placeholder instead of pre-filled lorem.
 */
export function blankStep(type: Step["type"], from: string): Step {
  switch (type) {
    case "message":
      return { type: "message", from, text: "" };
    case "reaction":
      return { type: "reaction", target: "$prev", emoji: "👍" };
    case "typing":
      return { type: "typing", from };
    case "composerType":
      return { type: "composerType", from, text: "" };
    case "send":
      // No `from` — a send commits the preceding composer, inheriting its sender.
      return { type: "send" };
    case "system":
      return { type: "system", from, text: "" };
    case "edit":
      return { type: "edit", target: "$prev", text: "" };
    case "delete":
      return { type: "delete", target: "$prev" };
    case "readReceipt":
      return { type: "readReceipt", by: from };
    case "delay":
      return { type: "delay", duration: 1000 };
  }
}

/**
 * Change a step's type in place. Preserves the shared base fields
 * (id/instant) and carries over from/text/target/emoji/card when the new type
 * uses them; type-specific fields reset to `blankStep` defaults.
 */
export function changeStepType(
  config: ConfigInput,
  index: number,
  newType: Step["type"],
  defaultFrom: string,
): ConfigInput {
  const old = config.timeline[index] as Record<string, unknown> | undefined;
  if (!old) return config;
  const next = blankStep(
    newType,
    (old.from as string) ?? defaultFrom,
  ) as Record<string, unknown>;
  for (const k of ["id", "instant"] as const) {
    if (old[k] !== undefined) next[k] = old[k];
  }
  for (const k of ["from", "text", "target", "emoji", "card"] as const) {
    if (k in next && old[k] !== undefined) next[k] = old[k];
  }
  const timeline = config.timeline.map((s, i) =>
    i === index ? (next as unknown as Step) : s,
  );
  return { ...config, timeline };
}
