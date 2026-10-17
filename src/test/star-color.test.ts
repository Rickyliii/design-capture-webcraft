import { describe, expect, it } from "vitest";
import { starColorUpdate } from "@/lib/star-color";
import { PALETTE_IDS, teamOf } from "@/lib/light";
describe("changing an activated star color", () => {
  it("allows all eight colors", () => {
    for (const color of PALETTE_IDS) expect(starColorUpdate(color)).toEqual({ star_color: color });
  });
  it("keeps identity and participation when switching violet to blue", () => {
    const fan = { fan_id: "same-fan", nickname: "Alex", star_type: "Pulsar", star_color: "electric_violet", activated: true, light_sent: true, challenge_done: true };
    const next = { ...fan, ...starColorUpdate("ice_cyan") };
    expect(next).toEqual({ ...fan, star_color: "ice_cyan" });
    expect(teamOf(next.star_color)).toBe("blue");
  });
  it("rejects arbitrary values", () => expect(() => starColorUpdate("invalid")).toThrow());
});