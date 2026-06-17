import { describe, expect, it } from "vitest";
import { configSchema, type ConfigInput } from "@typecaast/schema";
import {
  addParticipant,
  addStep,
  blankStep,
  deleteStep,
  duplicateStep,
  moveStep,
  changeStepType,
  removeParticipant,
  setCanvas,
  setSelf,
  setSkin,
  updateMeta,
  updatePacing,
  updateParticipant,
  updateStep,
} from "./store.js";

const base: ConfigInput = {
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "slack" } },
  participants: [
    { id: "a", name: "A", isSelf: true },
    { id: "b", name: "B" },
  ],
  timeline: [
    { type: "message", from: "a", text: "one" },
    { type: "message", from: "b", text: "two" },
  ],
};

describe("config store", () => {
  it("adds, updates, deletes, moves, and duplicates steps immutably", () => {
    const added = addStep(base, { type: "send", from: "a" });
    expect(added.timeline).toHaveLength(3);
    expect(base.timeline).toHaveLength(2); // original untouched

    const updated = updateStep(base, 0, { text: "edited" } as never);
    expect((updated.timeline[0] as { text: string }).text).toBe("edited");

    expect(deleteStep(base, 0).timeline).toHaveLength(1);

    const moved = moveStep(base, 0, 1);
    expect((moved.timeline[0] as { text: string }).text).toBe("two");

    const dup = duplicateStep(base, 0);
    expect(dup.timeline).toHaveLength(3);
    expect((dup.timeline[1] as { text: string }).text).toBe("one");
  });

  it("manages participants and meta", () => {
    const withP = addParticipant(base, { id: "c", name: "C" });
    expect(withP.participants).toHaveLength(3);
    expect(
      updateParticipant(base, 1, { name: "Bee" }).participants[1]!.name,
    ).toBe("Bee");
    expect(removeParticipant(base, 0).participants).toHaveLength(1);
    expect(setSkin(base, "imessage").meta.skin.id).toBe("imessage");
    expect(updateMeta(base, { seed: 99 }).meta.seed).toBe(99);
  });

  it("setSelf marks exactly one viewer", () => {
    // `base` starts with participant a as self; move it to b.
    const next = setSelf(base, 1);
    expect(next.participants.filter((p) => p.isSelf === true)).toHaveLength(1);
    expect(next.participants[1]!.isSelf).toBe(true);
    expect(next.participants[0]!.isSelf).toBeUndefined();
  });

  it("changeStepType preserves shared + compatible fields", () => {
    const cfg: ConfigInput = {
      ...base,
      timeline: [
        { type: "message", from: "b", text: "hi", id: "m1", delay: 500 },
      ],
    };
    // message → composerType keeps from/text/id/delay
    const ct = changeStepType(cfg, 0, "composerType", "a")
      .timeline[0] as Record<string, unknown>;
    expect(ct.type).toBe("composerType");
    expect(ct.from).toBe("b");
    expect(ct.text).toBe("hi");
    expect(ct.id).toBe("m1");
    expect(ct.delay).toBe(500);
    // message → reaction drops text (not a reaction field) but keeps id/delay
    const rx = changeStepType(cfg, 0, "reaction", "a").timeline[0] as Record<
      string,
      unknown
    >;
    expect(rx.type).toBe("reaction");
    expect(rx.text).toBeUndefined();
    expect(rx.emoji).toBe("👍");
    expect(rx.id).toBe("m1");
  });

  it("sets canvas + pacing", () => {
    expect(setCanvas(base, 1080, 1920).meta.canvas).toEqual({
      width: 1080,
      height: 1920,
    });
    expect(updatePacing(base, { readingWpm: 300 }).pacing?.readingWpm).toBe(
      300,
    );
  });

  it("blankStep produces valid steps for every type", () => {
    const types = [
      "message",
      "reaction",
      "typing",
      "composerType",
      "send",
      "system",
      "edit",
      "delete",
      "readReceipt",
      "beat",
    ] as const;
    for (const t of types) {
      const cfg = { ...base, timeline: [blankStep(t, "a")] };
      expect(() => configSchema.parse(cfg)).not.toThrow();
    }
  });
});
