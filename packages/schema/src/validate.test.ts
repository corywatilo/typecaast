import { describe, expect, it } from "vitest";
import { validateConfig } from "./validate.js";

const valid = {
  version: 1,
  meta: { canvas: { width: 880, height: 720 }, skin: { id: "slack" } },
  participants: [
    { id: "cory", name: "Cory", isSelf: true },
    { id: "paul", name: "Paul" },
  ],
  timeline: [
    { type: "message", from: "cory", text: "hi", id: "m1" },
    { type: "reaction", target: "m1", emoji: "🦔" },
    { type: "composerType", from: "cory", text: "typing" },
    { type: "send" },
  ],
};

const codes = (raw: unknown) => validateConfig(raw).map((d) => d.code);

describe("validateConfig", () => {
  it("returns no diagnostics for a valid config", () => {
    expect(validateConfig(valid)).toEqual([]);
  });

  it("flags a version newer than the runtime and stops", () => {
    const diags = validateConfig({ ...valid, version: 99 });
    expect(diags).toHaveLength(1);
    expect(diags[0]?.code).toBe("E_VERSION");
    expect(diags[0]?.severity).toBe("error");
  });

  it("reports schema errors with a location", () => {
    const diags = validateConfig({
      version: 1,
      meta: { canvas: { width: 0, height: 720 }, skin: { id: "x" } },
      participants: [],
      timeline: [],
    });
    expect(diags.some((d) => d.code === "E_SCHEMA")).toBe(true);
    expect(diags.find((d) => d.code === "E_SCHEMA")?.location).toContain(
      "canvas",
    );
  });

  it("errors on a step referencing an unknown participant", () => {
    const diags = validateConfig({
      ...valid,
      timeline: [{ type: "message", from: "ghost", text: "boo" }],
    });
    expect(diags.some((d) => d.code === "E_REF_PARTICIPANT")).toBe(true);
  });

  it("errors on duplicate participant ids", () => {
    const diags = validateConfig({
      ...valid,
      participants: [
        { id: "cory", name: "Cory", isSelf: true },
        { id: "cory", name: "Cory 2" },
      ],
    });
    expect(diags.some((d) => d.code === "E_DUP_PARTICIPANT")).toBe(true);
  });

  it("warns (not errors) on an unresolved reaction target", () => {
    const diags = validateConfig({
      ...valid,
      timeline: [
        { type: "message", from: "cory", text: "hi" },
        { type: "reaction", target: "nope", emoji: "👍" },
      ],
    });
    const target = diags.find((d) => d.code === "W_TARGET");
    expect(target?.severity).toBe("warning");
  });

  it("warns on $prev with no preceding message", () => {
    expect(
      codes({
        ...valid,
        timeline: [{ type: "reaction", target: "$prev", emoji: "👍" }],
      }),
    ).toContain("W_NO_PREV");
  });

  it("warns once when the composer is used with no self participant", () => {
    const diags = validateConfig({
      ...valid,
      participants: [{ id: "paul", name: "Paul" }],
      timeline: [
        { type: "composerType", from: "paul", text: "x" },
        { type: "send", from: "paul" },
      ],
    });
    expect(diags.filter((d) => d.code === "W_NO_SELF")).toHaveLength(1);
  });
});
