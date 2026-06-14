import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { diagnoseFile } from "./commands/validate.js";
import { EXIT, resolveExitCode } from "./exit-codes.js";

const dir = mkdtempSync(join(tmpdir(), "typecaast-cli-"));
function fixture(name: string, contents: string): string {
  const path = join(dir, name);
  writeFileSync(path, contents);
  return path;
}

const validConfig = JSON.stringify({
  version: 1,
  meta: { canvas: { width: 880, height: 720 }, skin: { id: "slack" } },
  participants: [{ id: "cory", name: "Cory", isSelf: true }],
  timeline: [{ type: "message", from: "cory", text: "hi" }],
});

describe("diagnoseFile + resolveExitCode", () => {
  it("returns no diagnostics and OK for a valid config", () => {
    const diags = diagnoseFile(fixture("ok.json", validConfig));
    expect(diags).toEqual([]);
    expect(resolveExitCode(diags)).toBe(EXIT.OK);
  });

  it("reports E_IO (exit 4) for a missing file", () => {
    const diags = diagnoseFile(join(dir, "does-not-exist.json"));
    expect(diags[0]?.code).toBe("E_IO");
    expect(resolveExitCode(diags)).toBe(EXIT.IO);
  });

  it("reports E_JSON (exit 4) for malformed JSON", () => {
    const diags = diagnoseFile(fixture("bad.json", "{ not json"));
    expect(diags[0]?.code).toBe("E_JSON");
    expect(resolveExitCode(diags)).toBe(EXIT.IO);
  });

  it("reports E_SCHEMA (exit 2) for an invalid config", () => {
    const diags = diagnoseFile(
      fixture(
        "schema.json",
        JSON.stringify({
          version: 1,
          meta: { canvas: { width: 0, height: 1 }, skin: { id: "x" } },
          participants: [],
          timeline: [],
        }),
      ),
    );
    expect(diags.some((d) => d.code === "E_SCHEMA")).toBe(true);
    expect(resolveExitCode(diags)).toBe(EXIT.VALIDATION);
  });

  it("reports E_VERSION (exit 3) for a too-new config", () => {
    const diags = diagnoseFile(
      fixture(
        "version.json",
        JSON.stringify({
          version: 99,
          meta: { canvas: { width: 1, height: 1 }, skin: { id: "x" } },
          participants: [],
          timeline: [],
        }),
      ),
    );
    expect(resolveExitCode(diags)).toBe(EXIT.VERSION);
  });

  it("keeps warnings at exit 0", () => {
    const diags = diagnoseFile(
      fixture(
        "warn.json",
        JSON.stringify({
          version: 1,
          meta: { canvas: { width: 880, height: 720 }, skin: { id: "slack" } },
          participants: [{ id: "cory", name: "Cory", isSelf: true }],
          timeline: [
            { type: "message", from: "cory", text: "hi" },
            { type: "reaction", target: "nonexistent", emoji: "👍" },
          ],
        }),
      ),
    );
    expect(diags.some((d) => d.severity === "warning")).toBe(true);
    expect(resolveExitCode(diags)).toBe(EXIT.OK);
  });
});
