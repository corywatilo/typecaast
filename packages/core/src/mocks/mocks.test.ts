import { describe, expect, it, vi } from "vitest";
import {
  MOCK_BILLING_TOAST_DURATION_MS,
  MOCK_BILLING_TOAST_STEPS,
  buildMockBillingToastState,
  createMockBillingToastGetStateAt,
  mockBillingToastSnapshots,
} from "./billing-toast.js";
import { createMockPlayer } from "./mock-player.js";

describe("buildMockBillingToastState", () => {
  it("is a pure function of time (deep-equal across calls)", () => {
    expect(buildMockBillingToastState(3000)).toEqual(
      buildMockBillingToastState(3000),
    );
  });

  it("starts empty and ends with the full thread", () => {
    const empty = buildMockBillingToastState(0);
    expect(empty.messages).toHaveLength(0);
    expect(empty.composer.text).toBe("");

    const end = buildMockBillingToastState(MOCK_BILLING_TOAST_DURATION_MS);
    // m1, m2, m3, system card, m4
    expect(end.messages).toHaveLength(5);
    expect(end.messages.at(-1)?.id).toBe("m4");
  });

  it("reveals the first message progressively", () => {
    expect(buildMockBillingToastState(600).messages[0]?.revealProgress).toBe(0);
    expect(
      buildMockBillingToastState(740).messages[0]?.revealProgress,
    ).toBeCloseTo(0.5, 1);
    expect(buildMockBillingToastState(900).messages[0]?.revealProgress).toBe(1);
  });

  it("shows Paul typing before his message lands", () => {
    const typing = buildMockBillingToastState(3000);
    expect(typing.typingIndicators).toHaveLength(1);
    expect(typing.typingIndicators[0]?.from).toBe("paul");
    // After his message appears, the indicator is gone.
    expect(buildMockBillingToastState(4400).typingIndicators).toHaveLength(0);
  });

  it("lands the hedgehog reaction on the first message", () => {
    const state = buildMockBillingToastState(2200);
    expect(state.messages[0]?.reactions[0]?.emoji).toBe("🦔");
  });

  it("types into the composer, then clears it on send", () => {
    const mid = buildMockBillingToastState(9800);
    expect(mid.composer.from).toBe("cory");
    expect(mid.composer.text.length).toBeGreaterThan(0);
    // After m4 is sent the composer is empty again.
    expect(buildMockBillingToastState(11500).composer.text).toBe("");
  });

  it("groups consecutive same-author messages", () => {
    const end = buildMockBillingToastState(MOCK_BILLING_TOAST_DURATION_MS);
    const m3 = end.messages.find((m) => m.id === "m3");
    const m2 = end.messages.find((m) => m.id === "m2");
    expect(m2?.isGrouped).toBe(false); // paul follows cory
    expect(m3?.isGrouped).toBe(false); // cory follows paul
  });

  it("exposes named snapshots", () => {
    expect(mockBillingToastSnapshots.empty.messages).toHaveLength(0);
    expect(mockBillingToastSnapshots.complete.messages).toHaveLength(5);
  });
});

describe("createMockPlayer", () => {
  const getStateAt = createMockBillingToastGetStateAt("dark");

  it("samples the initial state at t=0", () => {
    const player = createMockPlayer(getStateAt, {
      durationMs: MOCK_BILLING_TOAST_DURATION_MS,
      steps: MOCK_BILLING_TOAST_STEPS,
    });
    expect(player.currentMs).toBe(0);
    expect(player.state.theme).toBe("dark");
    player.destroy();
  });

  it("seek updates state and fires seek + tick", () => {
    const player = createMockPlayer(getStateAt, {
      durationMs: MOCK_BILLING_TOAST_DURATION_MS,
    });
    const onTick = vi.fn();
    const onSeek = vi.fn();
    player.on("tick", onTick);
    player.on("seek", onSeek);
    player.seek(7800);
    expect(player.currentMs).toBe(7800);
    expect(player.state.messages.some((m) => m.variant === "system")).toBe(
      true,
    );
    expect(onTick).toHaveBeenCalledOnce();
    expect(onSeek).toHaveBeenCalledWith(7800);
    player.destroy();
  });

  it("clamps seek to the timeline bounds", () => {
    const player = createMockPlayer(getStateAt, { durationMs: 12000 });
    player.seek(-500);
    expect(player.currentMs).toBe(0);
    player.seek(999999);
    expect(player.currentMs).toBe(12000);
    player.destroy();
  });

  it("steps between boundaries", () => {
    const player = createMockPlayer(getStateAt, {
      durationMs: MOCK_BILLING_TOAST_DURATION_MS,
      steps: MOCK_BILLING_TOAST_STEPS,
    });
    player.stepNext();
    expect(player.currentMs).toBe(600);
    player.stepNext();
    expect(player.currentMs).toBe(2000);
    player.stepPrev();
    expect(player.currentMs).toBe(600);
    player.destroy();
  });

  it("unsubscribes via the returned disposer", () => {
    const player = createMockPlayer(getStateAt, { durationMs: 12000 });
    const onTick = vi.fn();
    const dispose = player.on("tick", onTick);
    dispose();
    player.seek(1000);
    expect(onTick).not.toHaveBeenCalled();
    player.destroy();
  });
});
