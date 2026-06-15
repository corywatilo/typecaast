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

/** A blank step of a given type, for the "add step" menu. */
export function blankStep(type: Step["type"], from: string): Step {
  switch (type) {
    case "message":
      return { type: "message", from, text: "New message" };
    case "reaction":
      return { type: "reaction", target: "$prev", emoji: "👍" };
    case "typing":
      return { type: "typing", from };
    case "composerType":
      return { type: "composerType", from, text: "Typing…" };
    case "send":
      return { type: "send", from };
    case "system":
      return { type: "system", from, text: "System message" };
    case "edit":
      return { type: "edit", target: "$prev", text: "Edited" };
    case "delete":
      return { type: "delete", target: "$prev" };
    case "readReceipt":
      return { type: "readReceipt", by: from };
    case "beat":
      return { type: "beat", duration: 1000 };
  }
}
