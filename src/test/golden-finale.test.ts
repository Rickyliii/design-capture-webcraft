import { describe, expect, it } from "vitest";
import { GOLDEN_FINALE_MS, isNewGoldCommand } from "@/lib/golden-finale";
import { stateForCommand, displayFor, type ShowState } from "@/lib/light";

const base: ShowState = { event_id: "test", mode: "idle", global_color: null, sequence_name: null, sequence_start_time: null, is_show_active: false, updated_at: "2026-10-18T14:00:00Z" };
const gold: ShowState = { ...base, ...stateForCommand("gold", new Date("2026-10-18T14:00:01Z")) };
describe("Golden finale safety", () => {
  it("triggers only a newer ALL GOLD command, including consecutive gold commands", () => {
    expect(isNewGoldCommand(base, gold)).toBe(true);
    expect(isNewGoldCommand(gold, { ...gold, updated_at: "2026-10-18T14:00:02Z" })).toBe(true);
    expect(isNewGoldCommand(gold, gold)).toBe(false);
    expect(isNewGoldCommand(gold, { ...gold, updated_at: base.updated_at })).toBe(false);
  });
  it("does not celebrate initial reads after refresh or reconnection", () => { expect(isNewGoldCommand(null, gold)).toBe(false); });
  it("does not affect Blue, Rose, Violet, STOP or personal-color restore", () => {
    for (const command of ["blue", "rose", "violet", "stop", "team"] as const) {
      expect(isNewGoldCommand(base, { ...base, ...stateForCommand(command, new Date("2026-10-18T14:00:02Z")) })).toBe(false);
    }
  });
  it("stops within 2–3 seconds while the existing display remains solid gold", () => {
    expect(GOLDEN_FINALE_MS).toBe(2800);
    expect(displayFor(gold, "lavender", Date.now() + GOLDEN_FINALE_MS)).toMatchObject({ hex: "#FACC15", breathing: false, wave: false });
  });
});