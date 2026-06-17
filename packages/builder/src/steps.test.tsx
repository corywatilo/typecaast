import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { STEP_TYPES } from "@typecaast/schema";
import { STEP_GROUPS, STEP_META, StepIcon } from "./steps.js";

describe("step metadata", () => {
  it("covers every step type with a description + an icon", () => {
    for (const t of STEP_TYPES) {
      expect(STEP_META[t]?.description).toBeTruthy();
      expect(renderToStaticMarkup(<StepIcon type={t} />)).toContain("<svg");
    }
  });

  it("groups partition all step types exactly once", () => {
    const grouped = STEP_GROUPS.flatMap((g) => g.types);
    expect([...grouped].sort()).toEqual([...STEP_TYPES].sort());
    expect(new Set(grouped).size).toBe(STEP_TYPES.length);
  });
});
