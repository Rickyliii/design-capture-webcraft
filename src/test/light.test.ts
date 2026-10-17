import { describe, expect, it } from "vitest";
import { awakeningPhase, displayFor, stateForCommand, STAR_COLORS, type ShowState } from "@/lib/light";

const base: ShowState = { event_id: "e", mode: "idle", global_color: null, sequence_name: null, sequence_start_time: null, is_show_active: false, updated_at: "" };

describe("live light", () => {
  it("awakening phases follow the 20s script", () => {
    expect([1, 5, 9, 13, 17, 21].map(awakeningPhase)).toEqual(["own", "violet", "blue", "gold", "own", "done"]);
  });
  it("ALL GOLD turns every phone gold", () => {
    const s = { ...base, ...stateForCommand("gold", new Date()) } as ShowState;
    expect(displayFor(s, "rose", Date.now()).hex).toBe(STAR_COLORS.gold.hex);
  });
  it("team colors restore each fan's own color", () => {
    const s = { ...base, ...stateForCommand("team", new Date()) } as ShowState;
    expect(displayFor(s, "rose", Date.now()).hex).toBe(STAR_COLORS.rose.hex);
  });
  it("stop returns phones to waiting", () => {
    const s = { ...base, ...stateForCommand("stop", new Date()) } as ShowState;
    expect(displayFor(s, "blue", Date.now()).waiting).toBe(true);
  });
});
