import { describe, expect, it } from "vitest";
import { openingFrame } from "@/lib/opening";
import { DEFAULT_TIMELINE } from "@/lib/music-show";
import type { ShowState } from "@/lib/light";
const start = Date.parse("2026-10-17T22:00:00Z");
const state: ShowState = { event_id: "test", mode: "music", global_color: null, sequence_name: null, sequence_start_time: new Date(start).toISOString(), is_show_active: true, updated_at: new Date(start).toISOString(), music_timeline: DEFAULT_TIMELINE };
describe("shared opening choreography", () => {
  it("waits until presenter start and never animates a stopped show", () => {
    expect(openingFrame(state, start - 1).visible).toBe(false);
    expect(openingFrame({ ...state, is_show_active: false }, start + 12000).visible).toBe(false);
  });
  it("late-joining phone and stage recover the same convergence phase", () => {
    const phone = openingFrame(state, start + 18000);
    expect(phone.phase).toBe("convergence");
    expect(phone).toEqual(openingFrame(state, start + 18000));
    expect(phone.seconds).toBe(16);
  });
  it("returns phones to personal lighting at the afterlight cue", () => {
    expect(openingFrame(state, start + 27000)).toMatchObject({ visible: false, phase: "reveal", complete: true });
  });
  it("retimes gathering to editable music boundaries", () => {
    expect(openingFrame({ ...state, music_timeline: { ...DEFAULT_TIMELINE, cues: [0, 4, 8, 12, 16, 20] } }, start + 20000).complete).toBe(true);
  });
});