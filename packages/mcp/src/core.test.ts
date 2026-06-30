import { describe, it, expect } from "vitest";
import {
  validate,
  scaffoldConfig,
  jsonSchema,
  SKINS,
  SCHEMA_ID,
} from "./core.js";

describe("validate", () => {
  it("accepts a scaffolded config (object)", () => {
    const r = validate(scaffoldConfig("slack"));
    expect(r.valid).toBe(true);
    expect(r.diagnostics).toEqual([]);
  });

  it("accepts a config given as a JSON string", () => {
    const r = validate(JSON.stringify(scaffoldConfig()));
    expect(r.valid).toBe(true);
  });

  it("reports unparseable JSON", () => {
    const r = validate("{ not json");
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/Invalid JSON/);
  });

  it("flags an unknown participant reference", () => {
    const cfg = {
      version: 1,
      meta: { canvas: { width: 600, height: 400 }, skin: { id: "slack" } },
      participants: [{ id: "me", name: "You", isSelf: true }],
      timeline: [{ type: "message", from: "ghost", text: "hi" }],
    };
    const r = validate(cfg);
    expect(r.valid).toBe(false);
    expect(r.diagnostics.some((d) => d.code === "E_REF_PARTICIPANT")).toBe(
      true,
    );
  });
});

describe("jsonSchema", () => {
  it("carries the canonical $id", () => {
    expect(jsonSchema().$id).toBe(SCHEMA_ID);
  });
});

describe("SKINS", () => {
  it("lists the built-in skins including slack", () => {
    expect(SKINS.length).toBeGreaterThanOrEqual(8);
    expect(SKINS.some((s) => s.id === "slack")).toBe(true);
  });
});
