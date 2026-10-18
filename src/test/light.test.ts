import { describe, expect, it } from "vitest";
import { awakeningPhase, colorInfo, displayFor, stateForCommand, teamOf, PALETTE_IDS, TEAMS, type ShowState } from "@/lib/light";

const base: ShowState = { event_id: "e", mode: "idle", global_color: null, sequence_name: null, sequence_start_time: null, is_show_active: false, updated_at: "" };
const run = (cmd: Parameters<typeof stateForCommand>[0], hex?: string) => ({ ...base, ...stateForCommand(cmd, new Date(), hex) }) as ShowState;

describe("live light", () => {
  it("has 8 colors, two per team", () => {
    expect(PALETTE_IDS.length).toBe(8);
    expect(PALETTE_IDS.filter((c) => teamOf(c) === "violet")).toEqual(["electric_violet", "lavender"]);
    expect(teamOf("ice_cyan")).toBe("blue");
    expect(teamOf("crimson_red")).toBe("rose");
    expect(teamOf("amber")).toBe("gold");
  });
  it("older stars saved as a team keep that team", () => {
    expect(teamOf("rose")).toBe("rose");
    expect(colorInfo("violet").hex).toBe("#8B5CF6");
  });
  it("awakening returns to personal afterlight at 15 seconds", () => {
    expect([1, 3, 5, 7, 10, 14.999, 15].map(awakeningPhase)).toEqual(["own", "violet", "blue", "gold", "own", "own", "done"]);
  });
  it("ALL GOLD turns every phone gold", () => {
    expect(displayFor(run("gold"), "lavender", Date.now()).hex).toBe(TEAMS.gold.hex);
  });
  it("custom color reaches every phone", () => {
    expect(displayFor(run("custom", "#12ab9f"), "amber", Date.now()).hex).toBe("#12AB9F");
  });
  it("rejects invalid custom colors", () => {
    expect(() => stateForCommand("custom", new Date(), "red")).toThrow();
  });
  it("restore personal colors shows each fan's own color", () => {
    expect(displayFor(run("team"), "ice_cyan", Date.now()).hex).toBe("#38BDF8");
  });
  it("wave and breathing use the fan's own color", () => {
    expect(displayFor(run("wave"), "amber", Date.now())).toMatchObject({ hex: "#F59E0B", wave: true });
    expect(displayFor(run("breathing"), "amber", Date.now()).breathing).toBe(true);
  });
  it("stop returns phones to waiting", () => {
    expect(displayFor(run("stop"), "cosmic_blue", Date.now()).waiting).toBe(true);
  });
});
